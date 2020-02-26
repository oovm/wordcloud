import type { QuadTreeNode, WordCloudElement } from "@doki-land/wordcloud-core";

/**
 * 四叉树实现，用于高效的碰撞检测和空间管理
 */
export class QuadTree {
    private root: QuadTreeNode;
    private readonly maxElements: number;
    private readonly maxLevel: number;

    constructor(x: number, y: number, width: number, height: number, maxElements: number = 10, maxLevel: number = 5) {
        this.maxElements = maxElements;
        this.maxLevel = maxLevel;
        this.root = {
            x,
            y,
            width,
            height,
            elements: [],
            maxElements,
            level: 0,
        };
    }

    insert(element: WordCloudElement): void {
        this.insertIntoNode(this.root, element);
    }

    private insertIntoNode(node: QuadTreeNode, element: WordCloudElement): void {
        if (!this.intersects(node, element)) {
            return;
        }

        if (!node.children && node.elements.length < node.maxElements) {
            node.elements.push(element);
            return;
        }

        if (!node.children) {
            this.subdivide(node);
        }

        if (node.children) {
            for (const child of node.children) {
                this.insertIntoNode(child, element);
            }
        }
    }

    private subdivide(node: QuadTreeNode): void {
        if (node.level >= this.maxLevel) {
            return;
        }

        const halfWidth = node.width / 2;
        const halfHeight = node.height / 2;
        const level = node.level + 1;

        node.children = [
            {
                x: node.x,
                y: node.y,
                width: halfWidth,
                height: halfHeight,
                elements: [],
                maxElements: this.maxElements,
                level,
            },
            {
                x: node.x + halfWidth,
                y: node.y,
                width: halfWidth,
                height: halfHeight,
                elements: [],
                maxElements: this.maxElements,
                level,
            },
            {
                x: node.x,
                y: node.y + halfHeight,
                width: halfWidth,
                height: halfHeight,
                elements: [],
                maxElements: this.maxElements,
                level,
            },
            {
                x: node.x + halfWidth,
                y: node.y + halfHeight,
                width: halfWidth,
                height: halfHeight,
                elements: [],
                maxElements: this.maxElements,
                level,
            },
        ];

        for (const element of node.elements) {
            for (const child of node.children) {
                this.insertIntoNode(child, element);
            }
        }
        node.elements = [];
    }

    private intersects(node: QuadTreeNode, element: WordCloudElement): boolean {
        return !(
            element.x > node.x + node.width ||
            element.x + element.width < node.x ||
            element.y > node.y + node.height ||
            element.y + element.height < node.y
        );
    }

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
        result: WordCloudElement[],
    ): void {
        if (x > node.x + node.width || x + width < node.x || y > node.y + node.height || y + height < node.y) {
            return;
        }

        for (const element of node.elements) {
            if (this.elementIntersects(element, x, y, width, height)) {
                result.push(element);
            }
        }

        if (node.children) {
            for (const child of node.children) {
                this.queryNode(child, x, y, width, height, result);
            }
        }
    }

    private elementIntersects(element: WordCloudElement, x: number, y: number, width: number, height: number): boolean {
        return !(
            element.x > x + width ||
            element.x + element.width < x ||
            element.y > y + height ||
            element.y + element.height < y
        );
    }

    hasCollision(element: WordCloudElement): boolean {
        const candidates = this.query(element.x, element.y, element.width, element.height);

        return candidates.some((candidate) => candidate.id !== element.id && this.elementsCollide(element, candidate));
    }

    private elementsCollide(a: WordCloudElement, b: WordCloudElement): boolean {
        return !(a.x > b.x + b.width || a.x + a.width < b.x || a.y > b.y + b.height || a.y + a.height < b.y);
    }

    clear(): void {
        this.root.elements = [];
        this.root.children = undefined;
    }

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
