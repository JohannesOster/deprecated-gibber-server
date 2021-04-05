import server from 'infrastructure/server';

const port = process.env.port || 3000;
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
