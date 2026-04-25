import localtunnel from 'localtunnel'

const startTunnel = async () => {
  try {
    const tunnel = await localtunnel({
      port: 5000,
      subdomain: 'ai-agent-youssef-v2' // رابط ثابت ومميز ليك
    })

    console.log('-------------------------------------------')
    console.log('🚀 GLOBAL TUNNEL IS LIVE!')
    console.log(`🔗 API URL: ${tunnel.url}/api`)
    console.log('-------------------------------------------')

    tunnel.on('close', () => {
      console.log('Tunnel closed. Restarting...')
      startTunnel()
    })
  } catch (err) {
    console.error('Tunnel error:', err.message)
    setTimeout(startTunnel, 5000)
  }
}

startTunnel()
