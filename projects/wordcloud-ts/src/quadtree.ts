import { QuadTreeNode, WordCloudElement } from './types';

/**
 * 四叉树实现，用于高效的碰撞检测和空间管理
 */
export class QuadTree {
  private root: QuadTreeNode;
  private readonly maxElements: number;
  private readonly maxLevel: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    maxElements: number = 10,
    maxLevel: number = 5
  ) {
    this.maxElements = maxElements;
    this.maxLevel = maxLevel;
    this.root = {
      x,
      y,
      width,
      height,
      elements: [],
      maxElements,
      level: 0
    };
  }

  /**
   * 插入元素到四叉树
   */
  insert(element: WordCloudElement): void {
    this.insertIntoNode(this.root, element);
  }

  private insertIntoNode(node: QuadTreeNode, element: WordCloudElement): void {
    // 检查元素是否在节点范围内
    if (!this.intersects(node, element)) {
      return;
    }

    // 如果节点未分割且元素数量未超限
    if (!node.children && node.elements.length < node.maxElements) {
      node.elements.push(element);
      return;
    }

    // 如果节点未分割但需要分割
    if (!node.children) {
      this.subdivide(node);
    }

    // 尝试插入到子节点
    if (node.children) {
      for (const child of node.children) {
        this.insertIntoNode(child, element);
      }
    }
  }

  /**
   * 分割节点为四个子节点
   */
  private subdivide(node: QuadTreeNode): void {
    if (node.level >= this.maxLevel) {
      return;
    }

    const halfWidth = node.width / 2;
    const halfHeight = node.height / 2;
    const level = node.level + 1;

    node.children = [
      // 左上
      {
        x: node.x,
        y: node.y,
        width: halfWidth,
        height: halfHeight,
        elements: [],
        maxElements: this.maxElements,
        level
      },
      // 右上
      {
        x: node.x + halfWidth,
        y: node.y,
        width: halfWidth,
        height: halfHeight,
        elements: [],
        maxElements: this.maxElements,
        level
      },
      // 左下
      {
        x: node.x,
        y: node.y + halfHeight,
        width: halfWidth,
        height: halfHeight,
        elements: [],
        maxElements: this.maxElements,
        level
      },
      // 右下
      {
        x: node.x + halfWidth,
        y: node.y + halfHeight,
        width: halfWidth,
        height: halfHeight,
        elements: [],
        maxElements: this.maxElements,
        level
      }
    ];

    // 重新分配现有元素到子节点
    for (const element of node.elements) {
      for (const child of node.children) {
        this.insertIntoNode(child, element);
      }
    }
    node.elements = [];
  }

  /**
   * 检查元素是否与节点相交
   */
  private intersects(node: QuadTreeNode, element: WordCloudElement): boolean {
    return !(
      element.x > node.x + node.width ||
      element.x + element.width < node.x ||
      element.y > node.y + node.height ||
      element.y + element.height < node.y
    );
  }

  /**
   * 查询与给定区域相交的所有元素
   */
  query(x: number, y: number, width: number, height: number): WordCloudElement[] {
    const result: WordCloudElement[] = [];
    this.queryNode(this.root, x, y, width, height, result);
    return result;
  }

  private queryNode(
    node: QuadTreeNode,
    x: number,
    y: number,
    width: number,
    height: number,
    result: WordCloudElement[]
  ): void {
    // 检查查询区域是否与节点相交
    if (
      x > node.x + node.width ||
      x + width < node.x ||
      y > node.y + node.height ||
      y + height < node.y
    ) {
      return;
    }

    // 添加节点中的元素
    for (const element of node.elements) {
      if (this.elementIntersects(element, x, y, width, height)) {
        result.push(element);
      }
    }

    // 递归查询子节点
    if (node.children) {
      for (const child of node.children) {
        this.queryNode(child, x, y, width, height, result);
      }
    }
  }

  /**
   * 检查元素是否与指定区域相交
   */
  private elementIntersects(
    element: WordCloudElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    return !(
      element.x > x + width ||
      element.x + element.width < x ||
      element.y > y + height ||
      element.y + element.height < y
    );
  }

  /**
   * 检查新元素是否与现有元素碰撞
   */
  hasCollision(element: WordCloudElement): boolean {
    const candidates = this.query(
      element.x,
      element.y,
      element.width,
      element.height
    );

    return candidates.some(candidate => 
      candidate.id !== element.id && this.elementsCollide(element, candidate)
    );
  }

  /**
   * 检查两个元素是否碰撞
   */
  private elementsCollide(a: WordCloudElement, b: WordCloudElement): boolean {
    return !(
      a.x > b.x + b.width ||
      a.x + a.width < b.x ||
      a.y > b.y + b.height ||
      a.y + a.height < b.y
    );
  }

  /**
   * 清空四叉树
   */
  clear(): void {
    this.root.elements = [];
    this.root.children = undefined;
  }

  /**
   * 获取所有元素
   */
  getAllElements(): WordCloudElement[] {
    const result: WordCloudElement[] = [];
    this.collectElements(this.root, result);
    return result;
  }

  private collectElements(node: QuadTreeNode, result: WordCloudElement[]): void {
    result.push(...node.elements);
    if (node.children) {
      for (const child of node.children) {
        this.collectElements(child, result);
      }
    }
  }
}