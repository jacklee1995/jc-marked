import { logger } from "./logger";
import { STATES_Structuretree } from './type'

declare type Line = string;
declare type Code = { lang: string, code: string[] };
declare type PlainText = {
  type: 'plaintext',
  children: (Line | Code)[]
};
declare type HeaderLevel = 1 | 2 | 3 | 4 | 5 | 6;
declare type SubBranch = {
  type: 'header',
  title?: string,
  level?: HeaderLevel,
  children: (SubBranch | string)[]
};



class StructuretreeFSM {
  /**current state */
  private _state: STATES_Structuretree;
  /**Last state */
  private _last_state: STATES_Structuretree = STATES_Structuretree.IDLE;
  /**Next state */
  private _next_state: STATES_Structuretree | null = null;
  private _lines: string[];
  private _maxLevel: HeaderLevel = 6;
  // Last directory level
  private _level: HeaderLevel;
  private _treeNodes: (PlainText | SubBranch)[];
  private _codes: Code = { lang: "", code: [] };

  constructor(articleLines: string[], level: HeaderLevel = 1) {
    this._lines = articleLines;
    this._treeNodes = [];
    // Enter the initial state
    this._state = STATES_Structuretree.IDLE;
    this._level = level

  }
  executeInput(): void {
    this._lines.forEach(
      // Take a single line as a single input
      // Each input has three tasks: calculation state, state transition and running task.
      (input) => {
        this._count_new_state(input);
        this._enter_new_state(input)
        this._run_actions(input);
      }
    )
    if (this._level !== this._maxLevel) {
      // Each child node obtains its child nodes.
      this._treeNodes.forEach(
        (item) => {

          if (item.type === "header") {
            let children = new StructuretreeFSM(item.children as string[], this._level + 1 as HeaderLevel);
            children.executeInput();
            item.children = children.tree as any
          }
        }
      )
    }
  }

  /**
   * Get nodes set
   */
  get tree(): (PlainText | SubBranch)[] {
    return this._treeNodes
  }

  /**
   * Maximum header depth
   * 
   * Can be set to the numbers 1-6. 
   * In fact, it is only static type checking, which is realized 
   * by recursive sub-state machine and can be arbitrarily layered 
   * without checking the type.
   */
  set level(level: HeaderLevel) {
    this._maxLevel = level
  }

  /**The first paragraph: Determine the new status */
  private _count_new_state(input: string) {
    this._last_state = this._state;  // Save the current state
    switch (this._state) {
      case STATES_Structuretree.IDLE: this._whichNextAt_IDLE(input); break;
      case STATES_Structuretree.HEADER: this._whichNextAt_HEADER(input); break;
      case STATES_Structuretree.PLAINTEXT: this._whichNextAt_PLAINTEXT(input); break;
      case STATES_Structuretree.CODE: this._whichNextAt_CODE(input); break;
      default: console.error(`UNKNOWN STATE: ${this._state}`);
    }
  }

  /**The second paragraph: Complete the state transition and perform the operation of the new state. */
  private _enter_new_state(Line: string) {

    if (this._next_state != null && this._state !== this._next_state) {
      this._state = this._next_state;
    }
  }
  
  /**The third paragraph: Perform the operation in the new state. */
  private _run_actions(input: string) {
    switch (this._state) {
      case STATES_Structuretree.IDLE: this._action_IDLE(input); break;
      case STATES_Structuretree.HEADER: this._action_header(input); break;
      case STATES_Structuretree.PLAINTEXT: this._action_plaintext(input); break;
      case STATES_Structuretree.CODE: this._action_code(input); break;
    }
  }

  /* ********************************* Sub-method of Argument 1 (Determine new status) ********************************* */
  private _whichNextAt_IDLE(input: string) {
    this._whichNextAt_SharedNext(input);
  }

  private _whichNextAt_PLAINTEXT(input: string) {
    this._whichNextAt_SharedNext(input);
  }

  private _whichNextAt_HEADER(input: string) {
    this._whichNextAt_SharedNext(input);
  }

  /**Transformation logic shared by some states. */
  private _whichNextAt_SharedNext(input: string | object) {
    if (typeof input === 'string') {
      // Match the summary title of the current level.
      if ((new RegExp(`^#{${this._level}} `)).test(input)) {
        this._next_state = STATES_Structuretree.HEADER;
      }
      // Enter the code block
      else if (input.startsWith('```')) {
        this._next_state = STATES_Structuretree.CODE;
      }
      // Headlines that are not at the current level are all 
      // counted as paragraphs. For example, if they match h1, 
      // those with < = h2 are all counted as paragraphs.
      else {
        this._next_state = STATES_Structuretree.PLAINTEXT;
      }
    }
  }

  private _whichNextAt_CODE(input: string) {
    if (input === "```" && this._state === STATES_Structuretree.CODE) {
      this._next_state = STATES_Structuretree.IDLE;
    }
  }

  /* ********************************* Sub-method of Argument 3 (Perform new status actions) ********************************* */
  private _action_IDLE(input: string) {
    // The former state is a code block, and the latter state is not a code block. => Exiting code state
    if (this._last_state === STATES_Structuretree.CODE && this._next_state === STATES_Structuretree.IDLE) {
      logger.warn(`·· End ${this._codes.lang} Code Block!`)
      // The plain text part of the current summary begins with a code block.
      if (this._treeNodes.length === 0) {
        this._treeNodes.push(
          {
            type: "plaintext", children: [
              this._codes
            ]
          }
        )
      }
      // It is already in plain text state.
      else {
        const _ = this._treeNodes[this._treeNodes.length - 1];
        (_.children as (string | Code)[]).push(this._codes)
      }
    }
  }

  private _action_header(input: string) {
    if (typeof input === 'string') {
      // Get directory level
      // const level = (input.match(/^#{1,6}/) as RegExpMatchArray)[0].length;
      const title = input.replace(/^#{1,6}/, ''); // The specific text of header
      this._treeNodes.push(
        { type: "header", title: title, level: this._level, children: [] }
      )
    }
  }

  private _action_plaintext(input: string) {
    if (this._treeNodes.length === 0) {
      this._treeNodes.push(
        {
          type: "plaintext", children: [
            input
          ]
        }
      )
    } else {
      const _ = this._treeNodes[this._treeNodes.length - 1]
      _.children.push(input)
    }
  }

  private _action_code(input: string) {
    // The former state is not a code block, and the latter state is a code block. -> Just ready to enter the code block.
    if (this._last_state !== STATES_Structuretree.CODE && this._state === STATES_Structuretree.CODE) {
      const _ = input.split(' ')[0];
      this._codes.lang = _.replace(/^```/, "");
      logger.warn(`>> Enter code block: ${this._codes.lang} `);
      this._codes.code = [];
    }
    else if (this._last_state === STATES_Structuretree.CODE && this._state === STATES_Structuretree.CODE) {
      this._codes.code.push(input)

    }
  }
}

export {
  StructuretreeFSM
}