import { Task } from 'klasa';
import { spawn, Pool, Worker } from 'threads';

export default class extends Task {
	init() {
		this.run();
	}

	run() {
		this.client.killWorkerThread = Pool(() => spawn(new Worker('../lib/killWorker')), 8);

		const terminateCb = async () => {
			await this.client.killWorkerThread.terminate();
			process.exit(0);
		};

		process.removeAllListeners('SIGTERM');
		process.removeAllListeners('SIGINT');

		process.on('SIGTERM', terminateCb);
		process.on('SIGINT', terminateCb);
	}
}
