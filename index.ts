import express, { Application, Request, Response } from 'express';
import router from './routes/invoice';
import cors from 'cors';

const app: Application = express();
app.use(cors());
const PORT = 5000;

app.use(express.json());
app.use('/api', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Server is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
