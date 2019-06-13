---
date: "2018-08-01T12:00:00+03:00"
title: "Manipulating JSON Fields"
summary: Different ways to handle JSON.
tags: ["Go"]
---

_All the code can be found here [https://github.com/egonelbre/exp/tree/master/fields](https://github.com/egonelbre/exp/tree/master/fields)_

On reddit there was a question:

{{< biglink link="https://www.reddit.com/r/golang/comments/8y2zfc/looking_for_idiomatic_way_to_do_this/" title="Looking for idiomatic way to do this" description="I've been trying to figure out the best way to do this but always seem to fall short..." >}}

Before diving into answering it’s always useful to first dive into the question. It’s easy to lose track on what the actual problem is. Often by creating a better underlying model we can simplify or eliminate the problem altogether.

After a few questions I got that the [input JSON looks like this](https://www.reddit.com/r/golang/comments/8y2zfc/looking_for_idiomatic_way_to_do_this/e29c1ud/?context=3) (slightly simplified):

```
const Basic = `{
	"Fields": [
		{ "Name": "Alpha", "Type": "float", "Val": 15, "Multiplier": 0.5 },
		{ "Name": "Beta",  "Type": "uint",  "Val": 10, "Multiplier": 10   },
		{ "Name": "Gamma", "Type": "float", "Val": 10, "Multiplier": 0.5 }
	]
}`
```

The goal of the program is to write code that computes with these values according to names. For example:

```
"Alpha" + "Gamma" = 25 float
```

We’ll ignore the multiplier in this post. Unfortunately he wasn’t able to share the business problem, which could provide even more insight.

## Interface

The initial implementation was based on using interfaces. Interfaces are indeed one of the solutions for handling variability of the type. The most basic implementation could look something like this:

```
type Field interface {
	Name() string
}

type Uint struct {
	ID    string
	Value uint64
}

func (a *Uint) Name() string      { return a.ID }
func (a *Uint) Add(b *Uint) *Uint { return &Uint{Value: a.Value + b.Value} }
func (a *Uint) Sub(b *Uint) *Uint { return &Uint{Value: a.Value - b.Value} }

type Float struct {
	ID    string
	Value float64
}

func (a *Float) Name() string        { return a.ID }
func (a *Float) Add(b *Float) *Float { return &Float{Value: a.Value + b.Value} }
func (a *Float) Sub(b *Float) *Float { return &Float{Value: a.Value - b.Value} }
```

The content can be parsed from JSON using using a regular struct and unmarshal:

```
func ParseFields(r io.Reader) (map[string]Field, error) {
	var config struct {
		Fields []struct {
			Name       string
			Type       string
			Val        interface{}
			Multiplier interface{}
		}
	}

	err := json.NewDecoder(r).Decode(&config)
	if err != nil {
		return nil, err
	}

	fields := map[string]Field{}

	for _, jsonField := range config.Fields {
		val, valok := jsonField.Val.(float64)
		if !valok {
			return nil, errors.New("unsupported type " + jsonField.Type)
		}

		var field Field
		switch jsonField.Type {
		case "uint":
			field = &Uint{
				ID:    jsonField.Name,
				Value: uint64(val),
			}
		case "float":
			field = &Float{
				ID:    jsonField.Name,
				Value: float64(val),
			}
		default:
			return nil, errors.New("unsupported type " + jsonField.Type)
		}

		fields[field.Name()] = field
	}

	return fields, nil
}
```

There are other packages that could be more performant, but it’s not a vital part and we can always switch it out later if needed.

Now the question is, how do we write the code. Just writing `fields["Alpha"].Add(fields["Beta"])` , wouldn’t work since we only handle things that have specific type.

## Type-Switch

I guess the brute-force implementation could use a type-switch to do this:

```
func Add(a, b Field) Field {
	if aerr, ok := a.(*Error); ok {
		return aerr
	}
	if berr, ok := b.(*Error); ok {
		return berr
	}

	switch x := a.(type) {
	case *Float:
		if y, ok := b.(*Float); ok {
			return x.Add(y)
		} else {
			return &Error{"add type-mismatch"}
		}
	case *Uint:
		if y, ok := b.(*Uint); ok {
			return x.Add(y)
		} else {
			return &Error{"add type-mismatch"}
		}
	default:
		return &Error{"unhandled types"}
	}
}
```

We use “Error” field type to propagate errors around. It also could be done with manual error propagation or panic, but the Error field seemed a nice solution. Finally we will use all of these things together as:

```
fields, err := ParseFields(strings.NewReader(testdata.Basic))
if err != nil {
	log.Fatal(err)
}

fmt.Printf("%#+v\n", Add(fields["Alpha"], fields["Beta"]))
fmt.Printf("%#+v\n", Add(fields["Alpha"], fields["Gamma"]))
```

However, already with implementing two types a single operation becomes very verbose. This is also worsened with each new operation.

There’s a variation for this type-switch. Instead of using concrete type in `Add` we can use the interface `Field`. However this has the problem that it ties all the different `Field` implementations together.

```
func (a *Uint) Add(b Field) Field { ...
```

## Type-Map

We can avoid some of the boilerplate by using a type-map, which creates a mapping from types to a function:

```
type Op struct {
	Name  string
	Left  reflect.Type
	Right reflect.Type
}

var Ops = map[Op]func(a, b Field) Field{}

func init() {
	tUint := reflect.TypeOf(&Uint{})
	tFloat := reflect.TypeOf(&Float{})

	Ops[Op{"Add", tUint, tUint}] = func(a, b Field) Field { return a.(*Uint).Add(b.(*Uint)) }
	Ops[Op{"Sub", tUint, tUint}] = func(a, b Field) Field { return a.(*Uint).Sub(b.(*Uint)) }

	Ops[Op{"Add", tFloat, tFloat}] = func(a, b Field) Field { return a.(*Float).Add(b.(*Float)) }
	Ops[Op{"Sub", tFloat, tFloat}] = func(a, b Field) Field { return a.(*Float).Sub(b.(*Float)) }
}

func Call(name string, a, b Field) Field {
	if aerr, ok := a.(*Error); ok {
		return aerr
	}
	if berr, ok := b.(*Error); ok {
		return berr
	}

	ta, tb := reflect.TypeOf(a), reflect.TypeOf(b)
	call, found := Ops[Op{"Add", ta, tb}]
	if !found {
		return &Error{"unhandled op"}
	}
	return call(a, b)
}

func Add(a, b Field) Field { return Call("Add", a, b) }
func Sub(a, b Field) Field { return Call("Sub", a, b) }
```

For each “name and type pair” we assign a corresponding function. We’ll implement the generic Add / Sub in by looking up the function with the right signature. We can see a variation of this in [Ivy](https://github.com/robpike/ivy/blob/master/value/binary.go#L159). It has some nice benefits, like making type-promotions easier.

However, due to interfaces we end up with a lot of different type-conversions to make this happen. We lose all of the type-safety that our language gives us. Similarly it is easy to make a mistake when specifying the functions. That can be somewhat fixed by using reflection to find the func arguments.

This can be a pretty good solution when we need to mix multiple types and the “math” comes from the end-user and not the programmer. In that scenario we cannot rely on the language type-safety anyways.

## Reflection

Let’s consider whether using varying types is necessary at all. When we have the correct types from the beginning, we won’t have to deal with the conversions in the first place.

We can try to implement something similar to JSON unmarshaling on arbitrary types. In essence:

```
var example struct {
	Alpha float64
	Gamma float64
	Beta  uint
}
err := Unmarshal(strings.NewReader(testdata.Basic), &example)
if err != nil {
	log.Fatal(err)
}

fmt.Println(example.Alpha + example.Gamma)
```

To make this implementation work, we first need to unmarshal JSON data into a structure. This is quite similar to the previous cases:

```
func Unmarshal(rd io.Reader, data interface{}) error {
	var config jsonConfig
	err := json.NewDecoder(rd).Decode(&config)
	if err != nil {
		return err
	}

	return config.Scan(data)
}

type jsonConfig struct {
	Fields []jsonField
}

type jsonField struct {
	Name       string
	Type       string
	Val        interface{}
	Multiplier interface{}
}
```

We then need to walk over all of the necessary fields with reflection. For each result field we also will find the corresponding field from JSON.

```
func (config *jsonConfig) Scan(r interface{}) error {
	// check that r is a pointer to some struct
	rv := reflect.ValueOf(r)
	if rv.Kind() != reflect.Ptr || rv.Elem().Kind() != reflect.Struct {
		return fmt.Errorf("expected pointer to a struct, got %T", r)
	}

	s := rv.Elem()
	t := s.Type()

	// iterate over all struct fields
	for i, n := 0, s.NumField(); i < n; i++ {
		resultField := s.Field(i)

		// find the corresponding field from config
		field, err := config.findField(t.Field(i).Name)
		if err != nil {
			return err
		}

		// assign field value to the struct field
		err = config.assignField(field, resultField.Addr().Interface())
		if err != nil {
			return err
		}
	}

	return nil
}
```

And finally assign the value to the field:

```
func (config *jsonConfig) assignField(field *jsonField, p interface{}) error {
	// p is a pointer to struct field
	switch p := p.(type) {
	case *uint:
		uv, ok := field.Val.(float64)
		if !ok || field.Type != "uint" {
			return fmt.Errorf("expected uint, got %T and %v", field.Val, field.Type)
		}
		*p = uint(uv)
	case *float64:
		uv, ok := field.Val.(float64)
		if !ok || field.Type != "float" {
			return fmt.Errorf("expected float, got %T and %v", field.Val, field.Type)
		}
		*p = uv
	default:
		return fmt.Errorf("unhandled field type %T", p)
	}
	return nil
}
```

This solution is nice and neat to use, however extending it with new types would be somewhat annoying. Working with reflection is error-prone and easy to miss specific cases.

## Composed serialization

We can avoid reflection by using a thing I call [composed serialization](/blog/composed-serialization). This is how we would write the `Field` interface:

```
type Field interface {
	Name() string
	Assign(typ string, value interface{}) error
}

type Float struct {
	FieldName string
	Value     *float64
}

func (s Float) Name() string { return s.FieldName }
func (s Float) Assign(typ string, val interface{}) error {
	uv, ok := val.(float64)
	if !ok || typ != "float" {
		return fmt.Errorf("expected float, got %T and %v", val, typ)
	}
	*s.Value = uv
	return nil
}
```

Notice that the `Value` is a pointer not the value itself. This allows us to assign the value to an arbitrary place. We can assign the values like:

```
func (config *jsonConfig) Scan(fields ...Field) error {
	for _, dst := range fields {
		name := dst.Name()
		src, err := config.findField(name)
		if err != nil {
			return err
		}

		err = dst.Assign(src.Type, src.Val)
		if err != nil {
			return err
		}
	}
	return nil
}
```

Finally we can use these all together as:

```
config := &jsonConfig{}
err = json.NewDecoder(strings.NewReader(testdata.Basic)).Decode(config)
if err != nil {
	log.Fatal(err)
}

var (
	alpha float64
	gamma float64
	beta  uint
)

err = config.Scan(
	Float{"Alpha", &alpha},
	Float{"Gamma", &gamma},
	Uint{"Beta", &beta},
)
if err != nil {
	log.Fatal(err)
}

fmt.Println(alpha + gamma)
```

We can make this little shorter by hiding the JSON part, but it’s not that important for the example. The neat thing is that we can add new field types without having to change the scanning part. Of course this implementation comes at the annoyance of having to explicitly write out the target type twice.

## Conclusion

This was another example in how a single problem can be solved in multiple ways. I definitely skipped many possible solutions. Remember that none of these is the “best solution”, each of them has different tradeoffs.

It’s easy to get stuck in a mindset where you want to solve a problem in a particular way. However, there are always many many solutions. Exercising this skill of infinite possibilities helps to find solutions that take less time to implement are more performant or easier to use.