import { Dinero } from "dinero.js";
import { toText } from "./support/money";

export type ResultLine = [string, string | null];

export class Result {
  private lines: ResultLine[] = [];

  addLine(label: string, amount: string | Dinero) {
    this.lines.push([
      label,
      typeof amount === "string" ? amount : toText(amount),
    ]);
  }

  addTitle(label: string) {
    this.lines.push([label, null]);
  }

  getLines() {
    return this.lines;
  }
}
