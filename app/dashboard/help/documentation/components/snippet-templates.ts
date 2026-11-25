export interface SnippetContext {
	fullUrl: string;
	method: string;
	payload: unknown;
	apiKey: string;
}

function curlSnippet(ctx: SnippetContext): string {
	if (ctx.method === "POST") {
		return `curl -X POST ${ctx.fullUrl} \\
  -H "x-api-key: ${ctx.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(ctx.payload)}'`;
	}
	return `curl -X GET ${ctx.fullUrl} \\
  -H "x-api-key: ${ctx.apiKey}"`;
}

function nodeSnippet(ctx: SnippetContext): string {
	const body = ctx.method === "POST" ? `,\n  ${JSON.stringify(ctx.payload, null, 2)}, ` : "";
	const method = ctx.method.toLowerCase();
	return `const axios = require('axios');

const response = await axios.${method}('${ctx.fullUrl}'${body}
  {
    headers: {
      'x-api-key': '${ctx.apiKey}'${ctx.method === "POST" ? ",\n      'Content-Type': 'application/json'" : ""}
    }
  }
);

console.log(response.data);`;
}

function pythonSnippet(ctx: SnippetContext): string {
	if (ctx.method === "POST") {
		return `import requests

url = "${ctx.fullUrl}"
headers = {
    "x-api-key": "${ctx.apiKey}",
    "Content-Type": "application/json"
}
payload = ${JSON.stringify(ctx.payload, null, 4)}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
	}
	return `import requests

url = "${ctx.fullUrl}"
headers = {
    "x-api-key": "${ctx.apiKey}"
}

response = requests.get(url, headers=headers)
print(response.json())`;
}

function goSnippet(ctx: SnippetContext): string {
	if (ctx.method === "POST") {
		return `package main

import (
	"bytes"
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "${ctx.fullUrl}"
	var jsonStr = []byte(\`${JSON.stringify(ctx.payload)}\`)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))
	req.Header.Set("x-api-key", "${ctx.apiKey}")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil { panic(err) }
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))
}`;
	}
	return `package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "${ctx.fullUrl}"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("x-api-key", "${ctx.apiKey}")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil { panic(err) }
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))
}`;
}

function phpSnippet(ctx: SnippetContext): string {
	const postLines = ctx.method === "POST"
		? `\ncurl_setopt($ch, CURLOPT_POST, 1);\ncurl_setopt($ch, CURLOPT_POSTFIELDS, '${JSON.stringify(ctx.payload)}');`
		: "";
	const contentType = ctx.method === "POST" ? ",\n  'Content-Type: application/json'" : "";
	return `<?php

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "${ctx.fullUrl}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);${postLines}

$headers = array(
  'x-api-key: ${ctx.apiKey}'${contentType}
);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$result = curl_exec($ch);
curl_close($ch);

echo $result;`;
}

/** Builds a copy-pasteable snippet for the given language. */
export function buildSnippet(lang: string, ctx: SnippetContext): string {
	switch (lang) {
		case "curl":
			return curlSnippet(ctx);
		case "node":
			return nodeSnippet(ctx);
		case "python":
			return pythonSnippet(ctx);
		case "go":
			return goSnippet(ctx);
		case "php":
			return phpSnippet(ctx);
		default:
			return "";
	}
}
