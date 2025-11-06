// Arquivo de teste para o sistema de login
// Execute o main.js primeiro para iniciar o servidor

const testAPI = async () => {
    const baseURL = 'http://localhost:3000'

    try {
        console.log('🚀 Testando sistema de autenticação...\n')

        // Teste 1: Cadastro de usuário
        console.log('📝 Teste 1: Cadastrando usuário...')
        const registerResponse = await fetch(`${baseURL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'João Silva',
                email: 'joao@example.com',
                password: 'minhasenha123',
            }),
        })

        const registerResult = await registerResponse.json()
        console.log('Resultado do cadastro:', registerResult)

        // Teste 2: Login com credenciais corretas
        console.log('\n🔐 Teste 2: Fazendo login...')
        const loginResponse = await fetch(`${baseURL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'joao@example.com',
                password: 'minhasenha123',
            }),
        })

        const loginResult = await loginResponse.json()
        console.log('Resultado do login:', loginResult)

        // Teste 3: Login com senha incorreta
        console.log('\n❌ Teste 3: Tentando login com senha incorreta...')
        const wrongLoginResponse = await fetch(`${baseURL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'joao@example.com',
                password: 'senhaerrada',
            }),
        })

        const wrongLoginResult = await wrongLoginResponse.json()
        console.log('Resultado do login incorreto:', wrongLoginResult)

        // Teste 4: Listar usuários
        console.log('\n👥 Teste 4: Listando usuários...')
        const usersResponse = await fetch(`${baseURL}/users`)
        const users = await usersResponse.json()
        console.log('Usuários cadastrados:', users)
    } catch (error) {
        console.error('Erro nos testes:', error.message)
        console.log(
            'Certifique-se de que o servidor está rodando (node main.js)'
        )
    }
}

// Executar testes se o servidor estiver rodando
testAPI()
