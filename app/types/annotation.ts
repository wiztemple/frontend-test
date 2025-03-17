export type AnnotationType =
  | "highlight"
  | "underline"
  | "comment"
  | "signature";

export interface Point {
  x: number;
  y: number;
}

export interface BaseAnnotation {
  id: string;
  type: AnnotationType;
  pageNumber: number;
  color?: string;
}

export interface HighlightAnnotation extends BaseAnnotation {
  type: "highlight";
  bounds: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  };
  content?: string;
}

export interface UnderlineAnnotation extends BaseAnnotation {
  type: "underline";
  bounds: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  content?: string;
}

export interface CommentAnnotation extends BaseAnnotation {
  type: "comment";
  position: Point;
  content: string;
}

export interface SignatureAnnotation extends BaseAnnotation {
  type: "signature";
  points: Point[];
  position: Point;
  content?: string;
}

export type Annotation =
  | HighlightAnnotation
  | UnderlineAnnotation
  | CommentAnnotation
  | SignatureAnnotation;
