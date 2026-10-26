import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const excluded=new Set(['.git','node_modules','dist']);
const issues=[];let count=0;
const patterns=[['private-key',/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----\s*[A-Za-z0-9+/=\r\n]{200,}-----END/],['github-token',/\b(?:gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{25,})\b/],['google-key',/\bAIza[A-Za-z0-9_-]{32,}\b/]];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(excluded.has(entry.name))continue;const file=path.join(dir,entry.name);if(entry.isDirectory()){walk(file);continue;}const rel=path.relative(root,file);if(entry.name.startsWith('.env')&&entry.name!=='.env.example')issues.push([rel,'private-env']);if(entry.name.startsWith('.dev.vars')||/\.(?:sqlite3?|db|zip|png|jpe?g|webp|avif)$/i.test(entry.name))issues.push([rel,'forbidden-data-or-media']);const text=fs.readFileSync(file,'utf8');for(const [rule,re]of patterns)if(re.test(text))issues.push([rel,rule]);count++;}}
walk(root);console.log(JSON.stringify({files:count,issues},null,2));if(issues.length)process.exitCode=1;
