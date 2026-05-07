import { Dinero } from 'dinero.js';
import { toText } from './support/money';

export type ResultLine = [string, string | null, string | null, string | null, string | null];

export class Result {
  private lines: ResultLine[] = [];

  addLine(
    label: string,
    amount: any = null,
    url: string | null = null,
    group: string | null = null,
    position: string | null = null
  ) {
    this.lines.push([
      label,
      amount ? amount.toFormat('$0,0') : null,
      url,
      group,
      position
    ]);
  }

  addTitle(title: string) {
    // Titles are no longer needed as they're handled by the UI
  }

  getLines(): ResultLine[] {
    return this.lines;
  }
}
