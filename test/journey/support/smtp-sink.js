import net from 'node:net'

const PORT = 5615 // source: app/ProficiencyTestingWeb/Web.config SmtpPort

/** A local SMTP server that accepts and discards mail, so admin actions that send notification emails can complete. */
export async function startSmtpSink() {
  const server = net.createServer((socket) => {
    let inData = false
    let buffer = ''
    socket.write('220 localhost journey-sink\r\n')
    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8')
      const lines = buffer.split('\r\n')
      buffer = lines.pop()
      for (const line of lines) {
        if (inData) {
          if (line === '.') { inData = false; socket.write('250 OK\r\n') }
          continue
        }
        const command = line.split(' ')[0].toUpperCase()
        if (command === 'DATA') { inData = true; socket.write('354 end with .\r\n') }
        else if (command === 'QUIT') { socket.end('221 bye\r\n') }
        else socket.write('250 OK\r\n')
      }
    })
    socket.on('error', () => {})
  })
  const started = await new Promise((resolve) => {
    server.once('error', () => resolve(false)) // another worker already runs the sink
    server.listen(PORT, '127.0.0.1', () => resolve(true))
  })
  return () => (started ? new Promise((resolve) => server.close(resolve)) : Promise.resolve())
}
