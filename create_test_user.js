const { createClient } = require('/Users/mnosys/Documents/Antigravit AI /Iamautom Skool/iamautom-community/node_modules/@insforge/sdk');

const insforge = createClient({
    baseUrl: 'https://qqb6n6g7.us-east.insforge.app',
    apiKey: 'ik_0890c68bf12535ce997699529d26c604'
});

async function run() {
    const email = 'temp_password_check_' + Date.now() + '@iamautom.test';
    const password = 'admin123';

    console.log('Creating user...');
    const { data, error } = await insforge.auth.signUp({
        email,
        password,
        name: 'Temp User'
    });

    if (error) {
        console.error('Error signing up:', error);
        return;
    }

    console.log('User created email:', email);
}

run();
