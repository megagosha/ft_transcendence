export class ErrorUtil {
  private constructor() {
  }

  public static toMessages(message: any): string[] {
    if (Object.prototype.toString.call(message) == "[object Array]") {
      return  message;
    }
    return [message];
  }
}