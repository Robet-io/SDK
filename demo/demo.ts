//import { buildTypedSignature } from "../dist/libclaim"
import {SDK, ClaimTransaction} from "../src/SDK"
//import express from "express";
import fs from "fs";

const WebSocketServer = require('ws').WebSocketServer;

const wss = new WebSocketServer({port: 8666});

const configuration = require("../src/configuration.json");

wss.on('connection', function connection(ws:any) {
	console.log("ws connection open");
	SDK.init({
		account: configuration.serverAddress,
		privateKey: configuration.privateKyeServer,
		network: {
			connect() {
			},
			send(message:string) {
				ws.send(message);
			},
		},
		claimDAO: {
			load() {

			},
			save(claim:ClaimTransaction) {
				fs.writeFile('claims/' + claim.addresses[0] + '.json', JSON.stringify(claim), (err) => {
					// throws an error, you could also catch it here
					if (err) throw err;

					// success case, the file was saved
					console.log('file!');
				});
			}
		}
	});
	ws.on('open', function open() {

	});
	ws.on('message', async function incoming(message:string) {
		console.log('received:', message);
		await SDK.onMessageReceived(message);
	});

	//ws.send('something');
});

/*
const typedSignature = buildTypedSignature({
	id: 1,
	alice: '0x0',
	bob: '0x0',
	nonce: 1,
	timestamp: Date.now(),
	cumulativeDebitAlice: 10,
	cumulativeDebitBob: 0
}, {
	name: "test",
	version: "1",
	chainId: 97,
	verifyingContract: "0x0"
})
console.log(JSON.stringify(typedSignature, null, 4))*/