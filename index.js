import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL = process.env.CLOUDFLARE_EMAIL;
const API_KEY = process.env.CLOUDFLARE_API_KEY;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const PROJECT_NAME = process.env.CLOUDFLARE_PROJECT_NAME;

if (!EMAIL || !API_KEY || !ACCOUNT_ID || !PROJECT_NAME) {
    console.error('Missing environment variables. Please check your .env file.');
    process.exit(1);
}

const headers = {
    'X-Auth-Email': EMAIL,
    'X-Auth-Key': API_KEY,
    'Content-Type': 'application/json',
    'User-Agent': 'CloudflarePages-Cleaner/1.0'
};

function request(method, path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.cloudflare.com',
            path: `/client/v4${path}`,
            method: method,
            headers: headers
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    if (body.startsWith('{')) {
                        const json = JSON.parse(body);
                        if (json.success) resolve(json);
                        else reject(json);
                    } else {
                        reject(body);
                    }
                } catch (e) {
                    reject(body);
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function start() {
    try {
        console.log(`Starting cleanup for project: ${PROJECT_NAME}`);
        let allDeployments = [];
        let page = 1;

        console.log('Fetching deployments...');
        while (true) {
            process.stdout.write(`Page ${page}... `);
            const data = await request('GET', `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments?page=${page}`);
            const deployments = data.result || [];
            allDeployments = allDeployments.concat(deployments);
            console.log(`Found ${deployments.length}`);

            if (deployments.length < 25) break;
            page++;
        }

        if (allDeployments.length === 0) {
            console.log('No deployments found.');
        } else {
            console.log(`\nTotal ${allDeployments.length} deployments found. Starting deletion...`);
            for (const dep of allDeployments) {
                try {
                    process.stdout.write(`Deleting ${dep.id}... `);
                    await request('DELETE', `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments/${dep.id}`);
                    console.log('Done.');
                } catch (e) {
                    const msg = e.errors ? e.errors[0].message : 'Unknown error';
                    console.log(`Failed: ${msg}`);
                }
                await new Promise(r => setTimeout(r, 200));
            }
        }

        console.log('\nDeployments cleared. Attempting final project deletion...');
        try {
            const delProject = await request('DELETE', `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}`);
            console.log('Status:', delProject.success ? 'PROJECT DELETED ✅' : 'FAILED ❌');
        } catch (e) {
            console.error('Project deletion failed:', e.errors ? e.errors[0].message : e);
        }

    } catch (e) {
        console.error('\nFatal Error:', e.errors ? e.errors[0].message : e);
    }
}

start();
