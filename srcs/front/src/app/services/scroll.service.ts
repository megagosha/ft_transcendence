export class ScrollService {
  node: any;
  previousScrollHeightMinusTop: number | any;
  readyFor: string | any;
  toReset: boolean = false;
  constructor() {}

  init(node: any) {
    this.node = node;
    this.previousScrollHeightMinusTop = 0;
    this.readyFor = 'up';
  }

  restore() {
    if(this.toReset) {
      if (this.readyFor === 'up') {
        this.node.scrollTop = this.node.scrollTopMax - this.previousScrollHeightMinusTop;
      }
      this.toReset = false;
    }
  }

  down() {
    if (this.node) {
      this.node.scrollTop = this.node.scrollTopMax;
    }
  }

  prepareFor(direction: string) {
    this.toReset = true;
    this.readyFor = direction || 'up';
    this.previousScrollHeightMinusTop = this.node ? this.node.scrollTopMax - this.node.scrollTop : 0;
  }
}
