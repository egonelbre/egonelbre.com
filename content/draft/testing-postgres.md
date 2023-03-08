---
draft: true
title: Testing Postgres with Go
description: "Different ways of setting up a Postgres database."
date: ""
tags: []
---

# Go Integration Tests with Postgres

When writing server side projects in Go, at some point you will also need to do some integration testing for the database.

In many cases there's a benefit in using a database interface and write mocks (or stubs, fakes) instead. However, there are quite a lot of cases where writing a mock wouldn't give a significant benefit or the database side is sufficiently complex and needs to be tested anyways.

Let's take a look at different ways of achieving this.

## Using `dockertest`

If you search around a bit, you'll eventually stumble upon https://github.com/ory/dockertest. It allows to quickly setup an isolated Postgres instance.

Let's see how to set it up. First, we need to create a `dockertest.Pool` for managing our resources. And we need to set it up in our `TestMain`:

```
var dockerPool *dockertest.Pool

func TestMain(m *testing.M) {
	var err error
	pool, err = dockertest.NewPool("")
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	// Set a time for our retries. A lower value probably makes more sense.
	pool.MaxWait = 120 * time.Second
	code := m.Run()
	os.Exit(code)
}
```

Then we'll need a helper for creating such database:

```
func TestCreateTable(t *testing.T) {
	ctx := context.Background()
	WithDatabase(ctx, t, func(t *testing.TB, db *pgx.Conn) {
		_, err := db.Exec(ctx, `CREATE TABLE accounts ( user_id serial PRIMARY KEY );`)
		if err != nil {
			t.Fatal(err)
		}
	})
}

func WithDatabase[TB testing.TB](ctx context.Context, tb TB, fn func(t TB, db *pgx.Conn)) {
	// snip
}
```

Coming back to the dockertest new instance creation:

```
func WithDatabase[TB testing.TB](ctx context.Context, tb TB, fn func(t TB, db *pgx.Conn)) {

	// First we need to specify the image we wish to use.

	resource, err := dockerPool.RunWithOptions(&dockertest.RunOptions{
		Repository: "postgres",
		Tag:        "15",
		Env: []string{
			"POSTGRES_PASSWORD=secret",
			"POSTGRES_USER=user",
			"POSTGRES_DB=main",
			"listen_addresses = '*'",
		},
	}, func(config *docker.HostConfig) {
		// set AutoRemove to true so that stopped container goes away by itself
		config.AutoRemove = true
		config.RestartPolicy = docker.RestartPolicy{Name: "no"}
	})
	if err != nil {
		tb.Fatalf("Could not start resource: %s", err)
	}
	defer func() {
		if err := dockerPool.Purge(resource); err != nil {
			tb.Logf("failed to stop: %v", err)
		}
	}()

	// Construct our connection string.

	hostAndPort := resource.GetHostPort("5432/tcp")
	databaseConnstr := fmt.Sprintf("postgres://user:secret@%s/main?sslmode=disable", hostAndPort)

	tb.Logf("Postgres listening on %q", databaseConnstr)

	err = resource.Expire(2 * 60) // hard kill the container after 2 minutes, just in case.
	if err != nil {
		tb.Fatalf("Unable to set container expiration: %v", err)
	}

	// Finally, try to connect to the container.
	// We need to retry, because it might take some time until the container becomes available.

	var db *pgx.Conn
	err = dockerPool.Retry(func() error {
		db, err = pgx.Connect(ctx, databaseConnstr)
		if err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		tb.Fatal("unable to connect to Postgres", err)
	}

	defer func() { 
		err := db.Close(ctx) 
		if err != nil {
			tb.Logf("failed to close db: %v", err)
		}
	}()

	// Finally call our test code.
	fn(tb, db)
}
```

Let's look at the performance:

```
Mac     2s
Windows 3s
```

## Using `CREATE DATABASE`

In most cases creating a new postgres instance per test isn't necessary. Instead, let's try an alternative approach, a new database in the same postgres instance per test.

```
// pgaddr is the main database we try to connect to.
// This allows to use a locally installed postgres instead of needing to rely on Docker.
// We could still create a docker database, if this flag is not provided.
var pgaddr = flag.String("database", os.Getenv("DATABASE_URL"), "database address")

func WithDatabase[TB testing.TB](ctx context.Context, tb TB, fn func(t TB, db *pgx.Conn)) {
	if *pgaddr == "" {
		tb.Skip("-database flag not defined")
	}
	dbaddr := *pgaddr

	// We need to create a unique database name so that our parallel tests don't clash.
	var id [8]byte
	rand.Read(id[:])
	uniqueName := tb.Name() + "/" + hex.EncodeToString(id[:])

	// Create the main connection that we use to create the database.
	maindb, err := pgx.Connect(ctx, dbaddr)
	if err != nil {
		tb.Fatalf("Unable to connect to database: %v", err)
	}

	// Run the database creation query and defer the database cleanup query.
	if err := createDatabase(ctx, maindb, uniqueName); err != nil {
		tb.Fatalf("unable to create database: %v", err)
	}
	defer func() {
		if err := dropDatabase(ctx, maindb, uniqueName); err != nil {
			tb.Fatalf("unable to drop database: %v", err)
		}
	}()

	// Modify the connection string to use a different database.
	connstr, err := connstrWithDatabase(dbaddr, uniqueName)
	if err != nil {
		tb.Fatal(err)
	}

	// Create a new connection to the database.
	db, err := pgx.Connect(ctx, connstr)
	if err != nil {
		tb.Fatalf("Unable to connect to database: %v", err)
	}
	defer func() { _ = db.Close(ctx) }()

	// Run our test code.
	fn(tb, db)
}
```

Now for the small utility funcs that we used:

```
// connstrWithDatabase changes the connstr to use a different database.
func connstrWithDatabase(connstr, database string) (string, error) {
	u, err := url.Parse(connstr)
	if err != nil {
		return "", fmt.Errorf("invalid connstr: %q", connstr)
	}
	u.Path = database
	return u.String(), nil
}

// createDatabase creates a new database with the specified name.
func createDatabase(ctx context.Context, db *pgx.Conn, name string) error {
	_, err := db.Exec(ctx, `CREATE DATABASE `+sanitizeDatabaseName(name)+`;`)
	return err
}

// dropDatabase drops the specific database.
func dropDatabase(ctx context.Context, db *pgx.Conn, name string) error {
	_, err := db.Exec(ctx, `DROP DATABASE `+sanitizeDatabaseName(name)+`;`)
	return err
}


// sanitizeDatabaseName is ensures that the database name is a valid postgres identifier.
func sanitizeDatabaseName(schema string) string {
	return pgx.Identifier{schema}.Sanitize()
}
```

The performance for this approach is better:

```
Mac      ~90ms
Windows  ...
```

## Using `CREATE SCHEMA`

Of course, 90ms is still a lot of time per single test. There's one interesting approach I discovered. It's possible to use a schema to create a relatively clean environment, which does not carry the same cost as creating a database.

TODO link to postgres schemas

Of course, this means that using schemas for any other purpose becomes more difficult. Similarly it might limit some features that you can use. Nevertheless, if it suits you:

```

func WithSchema[TB testing.TB](ctx context.Context, tb TB, fn func(t TB, db *pgx.Conn)) {
	if *pgaddr == "" {
		tb.Skip("-database flag not defined")
	}
	dbaddr := *pgaddr

	// We need to create a unique schema name so that our parallel tests don't clash.
	var id [8]byte
	rand.Read(id[:])
	uniqueName := tb.Name() + "/" + hex.EncodeToString(id[:])

	// Change the connection string to use a specific schema name.
	connstr, err := connstrWithSchema(dbaddr, uniqueName)
	if err != nil {
		tb.Fatal(err)
	}
	db, err := pgx.Connect(ctx, connstr)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		tb.Fatal(err)
	}
	defer func() { _ = db.Close(ctx) }()

	// Surprisingly, it's perfectly fine to create a schema after connecting with the name.
	if err := createSchema(ctx, db, uniqueName); err != nil {
		tb.Fatal(err)
	}
	defer func() {
		if err := dropSchema(ctx, db, uniqueName); err != nil {
			tb.Fatal(err)
		}
	}()

	fn(tb, db)
}
```

The smaller utilities that make it work:

```
// connstrWithSchema sets the schema for the connections.
func connstrWithSchema(connstr, schema string) (string, error) {
	u, err := url.Parse(connstr)
	if err != nil {
		return "", fmt.Errorf("invalid connstr: %q", connstr)
	}
	u.Query().Set("search_path", sanitizeSchemaName(schema))
	return u.String(), nil
}

// createSchema creates a new schema in the database.
func createSchema(ctx context.Context, db *pgx.Conn, schema string) error {
	_, err := db.Exec(ctx, `create schema if not exists `+sanitizeSchemaName(schema)+`;`)
	return err
}

// dropSchema drops the specified schema and associated data.
func dropSchema(ctx context.Context, db *pgx.Conn, schema string) error {
	_, err := db.Exec(ctx, `drop schema `+sanitizeSchemaName(schema)+` cascade;`)
	return err
}

// sanitizeSchemaName is ensures that the name is a valid postgres identifier.
func sanitizeSchemaName(schema string) string {
	return pgx.Identifier{schema}.Sanitize()
}
```

So, the benchmark shows:

```
Mac      ~14ms
Windows  ...
```

## Configuring Postgres

There are few things you can tweak in your database that allows some extra performance.

TODO

## Conclusion

We looked three different approaches to creating a "clean postgres environment" for integration testing. They aren't completely equivalent, but the fastest one that you can:

```
new instance per test 2s
new database per test 80ms
new schema   per test 15ms
```