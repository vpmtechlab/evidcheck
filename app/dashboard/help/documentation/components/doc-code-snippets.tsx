"use client";

import React, { useState } from "react";
import { Terminal, Code2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { servicePresets, ServicePreset } from "./doc-presets";

const languages = [
	{ id: "curl", name: "cURL", icon: Terminal },
	{ id: "node", name: "Node.js", icon: Code2 },
	{ id: "python", name: "Python", icon: Code2 },
	{ id: "go", name: "GoLang", icon: Code2 },
	{ id: "php", name: "PHP", icon: Code2 },
];

interface DocCodeSnippetsProps {
	selectedPreset?: ServicePreset;
	apiKey: string;
}

export function DocCodeSnippets({ selectedPreset: propPreset, apiKey }: DocCodeSnippetsProps) {
	const [activeLang, setActiveLang] = useState("curl");
	const [selectedPresetId, setSelectedPresetId] = useState(propPreset?.id || servicePresets[0].id);
	const [copiedCode, setCopiedCode] = useState(false);

	const preset = servicePresets.find((p) => p.id === selectedPresetId) || servicePresets[0];
	const keyToDisplay = apiKey || "evid_live_sk_8942104829104821";
	const baseUrl = "https://api.evidcheck.com";

	const getSnippet = () => {
		const fullUrl = `${baseUrl}${preset.endpoint}`;
		const isPost = preset.method === "POST";
		const jsonBody = isPost ? JSON.stringify(preset.payload, null, 2) : "";

		switch (activeLang) {
			case "curl":
				if (isPost) {
					return `curl -X POST ${fullUrl} \\
  -H "x-api-key: ${keyToDisplay}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(preset.payload)}'`;
				}
				return `curl -X GET ${fullUrl} \\
  -H "x-api-key: ${keyToDisplay}"`;

			case "node":
				if (isPost) {
					return `const axios = require('axios');

const response = await axios.post('${fullUrl}', 
  ${jsonBody}, 
  {
    headers: {
      'x-api-key': '${keyToDisplay}',
      'Content-Type': 'application/json'
    }
  }
);

console.log(response.data);`;
				}
				return `const axios = require('axios');

const response = await axios.get('${fullUrl}', {
  headers: {
    'x-api-key': '${keyToDisplay}'
  }
});

console.log(response.data);`;

			case "python":
				if (isPost) {
					return `import requests

url = "${fullUrl}"
headers = {
    "x-api-key": "${keyToDisplay}",
    "Content-Type": "application/json"
}
payload = ${JSON.stringify(preset.payload, null, 4)}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
				}
				return `import requests

url = "${fullUrl}"
headers = {
    "x-api-key": "${keyToDisplay}"
}

response = requests.get(url, headers=headers)
print(response.json())`;

			case "go":
				if (isPost) {
					return `package main

import (
	"bytes"
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "${fullUrl}"
	var jsonStr = []byte(\`${JSON.stringify(preset.payload)}\`)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))
	req.Header.Set("x-api-key", "${keyToDisplay}")
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
	url := "${fullUrl}"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("x-api-key", "${keyToDisplay}")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil { panic(err) }
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))
}`;

			case "php":
				if (isPost) {
					return `<?php

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "${fullUrl}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, '${JSON.stringify(preset.payload)}');

$headers = array(
  'x-api-key: ${keyToDisplay}',
  'Content-Type: application/json'
);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$result = curl_exec($ch);
curl_close($ch);

echo $result;`;
				}
				return `<?php

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "${fullUrl}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$headers = array(
  'x-api-key: ${keyToDisplay}'
);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$result = curl_exec($ch);
curl_close($ch);

echo $result;`;

			default:
				return "";
		}
	};

	const codeSnippet = getSnippet();

	const handleCopy = () => {
		navigator.clipboard.writeText(codeSnippet);
		setCopiedCode(true);
		setTimeout(() => setCopiedCode(false), 1500);
	};

	return (
		<div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden shadow-md">
			<div className="px-4 py-3 bg-gray-950 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
				<div className="flex items-center gap-3">
					<select
						value={selectedPresetId}
						onChange={(e) => setSelectedPresetId(e.target.value)}
						className="bg-gray-900 text-gray-200 border border-gray-700 text-xs font-mono rounded-md px-2.5 py-1 outline-none focus:border-[#188015]"
					>
						{servicePresets.map((p) => (
							<option key={p.id} value={p.id}>
								{p.method} {p.endpoint} ({p.label})
							</option>
						))}
					</select>

					<div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
						{languages.map((lang) => {
							const Icon = lang.icon;
							return (
								<button
									key={lang.id}
									onClick={() => setActiveLang(lang.id)}
									className={`
										px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors whitespace-nowrap
										${
											activeLang === lang.id
												? "bg-[#188015] text-white shadow-xs"
												: "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"
										}
									`}
								>
									<Icon size={12} />
									<span>{lang.name}</span>
								</button>
							);
						})}
					</div>
				</div>

				<Button
					variant="ghost"
					size="sm"
					onClick={handleCopy}
					className="h-7 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800 px-2.5 rounded-md gap-1"
				>
					{copiedCode ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
					<span>{copiedCode ? "Copied" : "Copy Code"}</span>
				</Button>
			</div>

			<pre className="p-4 overflow-x-auto custom-scrollbar font-mono text-xs leading-relaxed max-h-[320px] text-gray-200 bg-gray-900">
				<code>{codeSnippet}</code>
			</pre>
		</div>
	);
}
