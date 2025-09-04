import { Logger } from '@nestjs/common';

export class PlainLogger extends Logger {
  override log(message: string) {
    process.stdout.write(`[INFO] ${message}\n`);
  }

  override error(message: string, trace?: string) {
    process.stderr.write(`[ERROR] ${message}\n`);
    if (trace) {
      process.stderr.write(trace + '\n');
    }
  }

  override warn(message: string) {
    process.stdout.write(`[WARN] ${message}\n`);
  }
}
