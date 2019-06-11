---
date: "2017-05-04T12:00:00+03:00"
title: "Composed Serialization"
summary: How to write a low-effort composable DSL for serialization.
tags: ["Go"]
---

_Warning: code ahead!_

One of the annoying issues when handling bad or legacy data-formats, is getting the marshaling work with your own nice structures. The thing you want to read in might be a complicated mess of SOAP, but you want something nicer.

Let’s see the problem in action, here’s a “simple” response from a SOAP endpoint:

```
<Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/'>
  <Body>
    <GetAllColumnsResponse xmlns='http://zzz.com/'>
      <GetAllColumnsResult xmlns:i='http://www.w3.org/2001/XMLSchema-instance'>
        <ListColumnGroup1>
          <columns>
            <ListColumn1>
              <dataType>urn:zzz:list-type:string</dataType>
              <displayText>Project Name</displayText>
              <uri>urn:zzz:project-list-column:name</uri>
            </ListColumn1>
            <ListColumn1>
              <dataType>urn:zzz:list-type:string</dataType>
              <displayText>Code</displayText>
              <uri>urn:zzz:project-list-column:code</uri>
            </ListColumn1>
          </columns>
        </ListColumnGroup1>
      </GetAllColumnsResult>
    </GetAllColumnsResponse>
  </Body>
</Envelope>
```

SOAP \*some data redacted

So, how do we handle this mess?

Obviously we need to somehow reflect this structure in our code:

```
type AllColumnsResponse struct {
	Columns []Column `json:"columns"`
}

type Column struct {
	DisplayText string `json:"displayText"`
	DataType    string `json:"dataType"`
	URI         string `json:"uri"`
}

func (response *AllColumnsResponse) Spec() soap.Spec {
	return soap.Tag("Envelope",
		soap.Tag("Body",
			soap.Tag("GetAllColumnsResponse",
				soap.Tag("GetAllColumnsResult",
					soap.Tag("ListColumnGroup1",
						soap.TagList("columns", &response.Columns),
					),
				),
			),
		),
	)
}

func (column *Column) Spec() soap.Spec {
	return soap.Tag("ListColumn1",
		soap.String("dataType", &column.DataType),
		soap.String("displayText", &column.DisplayText),
		soap.String("uri", &column.URI),
	)
}
```

Defining how to marshal our structures.

This looks quite nice already ... but we still need to implement the `soap` package.

```
package soap

import "encoding/xml"

type Speced interface {
	Spec() Spec
}

type Spec interface {
	Speced
	Encode() *Node
	Decode(*Node)
}

type Node struct {
	XMLName xml.Name
	Content []byte `xml:",innerxml"`
	Nodes   []Node `xml:",any"`
}

func Parse(content []byte) (*Node, error) {
	var node Node
	err := xml.Unmarshal(content, &node)
	return &node, err
}

func (node *Node) Encode() ([]byte, error) {
	return xml.MarshalIndent(node, "", "\t")
}
```

Implementing the core.

```
package soap

type TagSpec struct {
	Name     string
	Children []Speced
}

func Tag(name string, children ...Speced) Spec {
	return &TagSpec{
		Name:     name,
		Children: children,
	}
}

func (spec *TagSpec) Spec() Spec { return spec }

func (spec *TagSpec) Encode() *Node {
	node := &Node{}
	node.XMLName.Local = spec.Name
	for _, child := range spec.Children {
		node.Nodes = append(node.Nodes, *child.Spec().Encode())
	}
	return node
}

func (spec *TagSpec) Decode(node *Node) {
	if spec.Name != node.XMLName.Local {
		panic("invalid name expected " + spec.Name + " got " + node.XMLName.Local)
	}
	if len(spec.Children) != len(node.Nodes) {
		panic("invalid number of children")
	}
	for i, child := range spec.Children {
		child.Spec().Decode(&node.Nodes[i])
	}
}

type StringSpec struct {
	Name  string
	Value *string
}

func String(name string, value *string) Spec {
	return &StringSpec{
		Name:  name,
		Value: value,
	}
}

func (spec *StringSpec) Spec() Spec { return spec }

func (spec *StringSpec) Encode() *Node {
	node := &Node{}
	node.XMLName.Local = spec.Name
	node.Content = []byte(*spec.Value)
	return node
}

func (spec *StringSpec) Decode(node *Node) {
	if spec.Name != node.XMLName.Local {
		panic("invalid name expected " + spec.Name + " got " + node.XMLName.Local)
	}
	if len(node.Nodes) != 0 {
		panic("expected no children for child spec")
	}
	*spec.Value = string(node.Content)
}
```

Here we define a `Node` for parsing arbitrary xml structures. We have `Spec` types that can encode and decode from this `Node` structure. _Strictly speaking_ `_Node_` _isn’t actually required. We could just as well implement the Spec types as Marshalers. In this case having a separate Node tree made things easier._

Here are two types `TagSpec` and `StringSpec`. One for walking the `Node` tree and the other for marshaling a string.

Implementing basic types.

We have `TagSpec` for pattern matching on names and `StringSpec` parsing into a string. Notice how the `StringSpec` writes to a string pointer, rather than a string.

Finally to wire all of this together:

```
node, _ := soap.Parse([]byte(data))
var response AllColumnsResponse
response.Spec().Decode(node)
```

[https://github.com/egonelbre/exp/tree/master/spec](https://github.com/egonelbre/exp/tree/master/spec)

The basic idea is to create a separate spec structure that has pointers to the target structure and then let the “spec” type handle all the marshaling/parsing, but write the result into the “target” structure.

{{< fig src="/_images/composed-serialization-spec-tree.png" >}}

This of course can be made to handle very complicated structures:

```
func (d *asnSignerInfo) marshaler() ber.Marshaler {
	return ber.Sequence{
		ber.Check{ber.Universal, ber.TagInteger, ber.Int64{&d.Version}},
		ber.Choice{
			ber.Check{ber.Universal, ber.TagSequence, &d.Issuer},
			ber.Check{ber.Context, 0, ber.OctetString{&d.SubjectKeyId}},
		},
		ber.Check{ber.Universal, ber.TagSequence, (*asnAlgorithmIdentifier)(&d.DigestAlgorithm)},
		ber.Optional{ber.Check{ber.Context, 0, &d.SignedAttrs}},
		ber.Check{ber.Universal, ber.TagSequence, (*asnAlgorithmIdentifier)(&d.SignatureAlgorithm)},
		ber.Check{ber.Universal, ber.TagOctetString, ber.OctetString{&d.Signature}},
		ber.Optional{ber.Check{ber.Context, 1, &d.UnsignedAttrs}},
	}
}
```

[https://github.com/egonelbre/exp/tree/master/ber](https://github.com/egonelbre/exp/tree/master/ber)

## Build your own

This approach gives us a easy way to write different DSL-s for marshaling data. You could imagine this being used for binary protocols or handling multiple formats with a single spec type.

General rule for implementing the spec structure.

**_Use a pointer to the type you want to capture._**

For example, `soap.TagSpec` didn’t want to capture the input ... hence it doesn’t contain pointers. `soap.StringSpec` wanted to capture a `string` and so the spec contained a `*string`. So, if you want to capture a `*UserInfo` then the spec type for it should contain `**UserInfo`.

_PS: The examples here were meant to be as a proof of concepts. You really should handle errors properly, with meaningful messages and depending on your application your result will vary._

## Conclusion

Spec types give a nice way of handling different complicated formats at the cost of some performance. They are flexible in their capabilities and can be composed quite nicely.

As a final exercise you can try writing a nested handler:

```
// From:
func (response *AllColumnsResponse) Spec() soap.Spec {
	return soap.Tag("Envelope",
		soap.Tag("Body",
			soap.Tag("GetAllColumnsResponse",
				soap.Tag("GetAllColumnsResult",
					soap.Tag("ListColumnGroup1",
						soap.TagList("columns", &response.Columns),
					),
				),
			),
		),
	)
}

// To:
func (response *AllColumnsResponse) Spec() soap.Spec {
	return soap.Nested("Envelope>Body>GetAllColumnsResponse>GetAllColumnsResult>ListColumnGroup1")(
		soap.TagList("columns", &response.Columns),
	)
}
```