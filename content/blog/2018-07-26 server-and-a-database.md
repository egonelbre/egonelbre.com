---
date: "2018-07-26T12:00:00+03:00"
title: "Server and a Database"
summary: Different ways to write a Server and a Database.
tags: ["Go"]
---

I have seen quite a few questions on how to setup a basic server and database in Go. I’ll show few versions, with each one handling more variability and more complex situations.

We are going to take a really small website, where you can submit comments and it will display them. We will cover interaction with the server and database, however we will mostly ignore the different ways of rendering the content and writing business logic. _Also, you should probably have some familiarity with Go databases and servers._

_You can imagine this as an example of_ [_“Infinite Possibilities”_](/article/learning-code-readability#exercise-cut-the-red-wire) _exercise._

### YOLO

_Code at_ [_https://github.com/egonelbre/db-demo/tree/master/00\_yolo_](https://github.com/egonelbre/db-demo/tree/master/00_yolo)

This is the version, that takes the least effort. This approach can be described as “throw everything together”.

``` go
db, err := sql.Open("postgres", "user=dbdemo password=dbdemo dbname=dbdemo sslmode=disable")
if err != nil {
	log.Fatal(err)
}

_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS Comments (
		"User"    TEXT,
		"Comment" TEXT
	)
`)
if err != nil {
	log.Fatal(err)
}

http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ShowErrorPage(w, http.StatusMethodNotAllowed, "Invalid method", nil)
		return
	}

	rows, err := db.Query(`SELECT "User", "Comment" FROM Comments`)
	if err != nil {
		ShowErrorPage(w, http.StatusInternalServerError, "Unable to access DB", err)
		return
	}

	comments := []Comment{}
	for rows.Next() {
		var comment Comment
		err := rows.Scan(&comment.User, &comment.Text)
		if err != nil {
			ShowErrorPage(w, http.StatusInternalServerError, "Unable to load data", err)
			return
		}
		comments = append(comments, comment)
	}

	if err := rows.Err(); err != nil {
		ShowErrorPage(w, http.StatusInternalServerError, "Failed to load data from DB", err)
		return
	}

	ShowCommentsPage(w, comments)
})
```
{{< codetitle caption="00_yolo/main.go" link="https://github.com/egonelbre/db-demo/blob/master/00_yolo/main.go" >}}

Everything in this file is mingled together and quite hard to follow. Any longer than this and it becomes unmaintainable.

However, this can be used as our first iteration until we figure out what needs to be done.

### Functions

_Code at_ [_https://github.com/egonelbre/db-demo/tree/master/01\_funcs_](https://github.com/egonelbre/db-demo/tree/master/01_funcs)

The first step towards separating HTTP from data storage is to use functions. We create functions for different interactions and then provide the database connection as the first parameter.

``` go
func listComments(db *sql.DB) ([]Comment, error) {
	rows, err := db.Query(`SELECT "User", "Comment" FROM Comments`)
	if err != nil {
		return nil, err
	}

	comments := []Comment{}
	for rows.Next() {
		var comment Comment
		err := rows.Scan(&comment.User, &comment.Text)
		if err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return comments, nil
}

func main() {
	db, err := sql.Open("postgres", "user=dbdemo password=dbdemo dbname=dbdemo sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}

	if err := initDatabse(db); err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			ShowErrorPage(w, http.StatusMethodNotAllowed, "Invalid method", nil)
			return
		}

		comments, err := listComments(db)
		if err != nil {
			ShowErrorPage(w, http.StatusInternalServerError, "Unable to access DB", err)
			return
		}

		ShowCommentsPage(w, comments)
	})

}
```
{{< codetitle caption="01_funcs/main.go" link="https://github.com/egonelbre/db-demo/blob/master/01_funcs/main.go" >}}

We could also separate these functions into a separate folder. Regardless the database methods are harder to find, especially when there are many such functions.

### Repository

_Code at_ [_https://github.com/egonelbre/db-demo/tree/master/02\_repo_](https://github.com/egonelbre/db-demo/tree/master/02_repo)

Instead of keeping separate functions we can attach them to a type.

``` go
commentsRepo, err := NewComments("user=dbdemo password=dbdemo dbname=dbdemo sslmode=disable")
if err != nil {
	log.Fatal(err)
}

http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ShowErrorPage(w, http.StatusMethodNotAllowed, "Invalid method", nil)
		return
	}

	comments, err := commentsRepo.List()
	if err != nil {
		ShowErrorPage(w, http.StatusInternalServerError, "Unable to access DB", err)
		return
	}

	ShowCommentsPage(w, comments)
})
```
{{< codetitle caption="02_repo/main.go" link="https://github.com/egonelbre/db-demo/blob/master/02_repo/main.go" >}}

Where the comments repository looks like:

``` go
type Comments struct {
	db *sql.DB
}

func (repo *Comments) List() ([]Comment, error) {
	rows, err := repo.db.Query(`SELECT "User", "Comment" FROM Comments`)
	if err != nil {
		return nil, err
	}

	comments := []Comment{}
	for rows.Next() {
		var comment Comment
		err := rows.Scan(&comment.User, &comment.Text)
		if err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return comments, nil
}
```
{{< codetitle caption="02_repo/comments.go" link="https://github.com/egonelbre/db-demo/blob/master/02_repo/comments.go" >}}

This keeps the comment related database interactions in a single place.

### Server

_Code at_ [_https://github.com/egonelbre/db-demo/tree/master/03\_server_](https://github.com/egonelbre/db-demo/tree/master/03_server)

Before we refactor the database more, we need to make the server clearer. The endpoint wiring in main didn’t look that nice. Instead let’s try this:

``` go
comments, err := NewComments("user=dbdemo password=dbdemo dbname=dbdemo sslmode=disable")
if err != nil {
	log.Fatal(err)
}

server := NewServer(comments)

log.Println("Started listening on :8080")
if err := http.ListenAndServe(":8080", server); err != nil {
	log.Fatal(err)
}
```
{{< codetitle caption="03_server/main.go" link="https://github.com/egonelbre/db-demo/blob/master/03_server/main.go" >}}

The `Server` looks like this:

``` go
type Server struct {
	comments *Comments
}

func (server *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch r.URL.Path {
	case "/":
		server.HandleList(w, r)
	case "/comment":
		server.HandleAddComment(w, r)
	default:
		ShowErrorPage(w, http.StatusNotFound, "Page not found", nil)
	}
}

func (server *Server) HandleList(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ShowErrorPage(w, http.StatusMethodNotAllowed, "Invalid method", nil)
		return
	}

	comments, err := server.comments.List()
	if err != nil {
		ShowErrorPage(w, http.StatusInternalServerError, "Unable to access DB", err)
		return
	}

	ShowCommentsPage(w, comments)
}
```
{{< codetitle caption="03_server/server.go" link="https://github.com/egonelbre/db-demo/blob/master/03_server/server.go" >}}

We have removed the global `Comments` repository and added it as a field to Server. Also, `Server` has become much easier to test.

### Interface

_Code at_ [_https://github.com/egonelbre/db-demo/tree/master/04\_interface_](https://github.com/egonelbre/db-demo/tree/master/04_interface)

It’s usually nice not to depend on the database implementation directly as it means we have to use specific database implementation for testing. By separating the `Comments` implementation and interface we make clearer our requirements and how we fulfill those requirements.

``` go
type Comments interface {
	Add(user, comment string) error
	List() ([]Comment, error)
}

type Server struct {
	comments Comments
}

func NewServer(comments Comments) *Server {
	return &Server{
		comments: comments,
	}
}
```
{{< codetitle caption="04_interface/server.go" link="https://github.com/egonelbre/db-demo/blob/master/04_interface/server.go" >}}

Since we wanted to separate them, the folder structure needs to change as well:

```
├── main.go
├── pgdb
│   └── comments.go
└── site
    ├── comment.go
    ├── present.go
    └── server.go
```

### Scope

_Code at_ [_https://github.com/egonelbre/db-demo/tree/master/05\_scope_](https://github.com/egonelbre/db-demo/tree/master/05_scope)

In the future we may need more repositories than `Comments`. There are few ways that we could handle it. One is to add all methods to a single type. However, that approach can get messy and unorganized after four different repositories.

The other approach is to create a separate implementation and pass them as arguments to `Server`. It has somewhat similar problem that we might end up with a lot of arguments.

We can also use hierarchical interfaces:

``` go
type DB interface {
	Comments() Comments
}

type Comments interface {
	Add(user, comment string) error
	List() ([]Comment, error)
}

type Server struct {
	db DB
}

func (server *Server) HandleList(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ShowErrorPage(w, http.StatusMethodNotAllowed, "Invalid method", nil)
		return
	}

	comments, err := server.db.Comments().List()
	if err != nil {
		ShowErrorPage(w, http.StatusInternalServerError, "Unable to access DB", err)
		return
	}

	ShowCommentsPage(w, comments)
}
```
{{< codetitle caption="05_scope/site/server.go" link="https://github.com/egonelbre/db-demo/blob/master/05_scope/site/server.go" >}}

It might look that this is too complicated and unclear why this is beneficial. Let’s take a look at when we have more than one repository and have added basic access control:

``` go
type DB interface {
	Auth() Auth
	Users(id user.ID) Users
	Comments(id user.ID) Comments
}

type Auth interface { ... }
type Users interface { ... }
type Comments interface { ... }
```

We can implement this interface as:

```
type DB struct {
	*sql.DB
}

func (db *DB) Comments(id user.ID) site.Comments { return &Comments{db, id} }

type Comments struct {
	db   *DB
	user user.ID
}

func (repo *Comments) Add(user, comment string) error {
	// check whether repo.user has rights to add a comment
	// add comment
}
```

Of course we can use different combinations of extending the DB.

```
type DB interface {
	Admin() AdminDB
	Comments() Comments
}

type AdminDB interface { 
	DB
	// only for admins
	RunMigrations() error
	DropDatabase() error
}
```

These small things help us avoid forgetting different access checks without having to create a separate argument for each of the methods.

### Conclusion

I think these five approaches should cover most of the needs, however specific scenarios might have more interesting solutions. Given a CRUD situation, you might need ORM. Sometimes, you may need a solution with multiple database engines (for example, one for content, one for text-search).

I think the most important thing is:

> **The right solution is the easiest that works for you.**

The complicated version handle more cases, however this comes at the cost of more indirection and more code artifacts. Prefer to start with a simple solution and refactor to a more complicated one when the time is right.