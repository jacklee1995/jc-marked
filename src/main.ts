import { AST_FSM } from './ast'
import { ArticleParams, STATES_MAIN } from './type'
import { logger } from './logger'

/**
 * Used to build Markdwon abstract syntax tree from text string.
 */
class Parser {
  /**current state */
  private _state: STATES_MAIN = STATES_MAIN.IDLE;
  /**Next state */
  private _next_state: STATES_MAIN | null = null;
  /**存储所有行构成的数组 */
  private _linesArray: string[];
  private _article_lines: any[] = [];          // 段落行
  private _article_tree: any[] = [];           // 段落树，由结构树子状态机生成
  private _extra_infos: ArticleParams = {
    title: '',
    subTitle: '',
    authors: [],
    summary: '',
    lastArticle: '',
    nextArticle: '',
  }

  constructor(text: string) {
    // set init state as IDLE
    this._state = STATES_MAIN.IDLE;
    // 将输入的文本进行拆分
    this._linesArray = this._readLine(text);
  }

  get res() {
    return {
      infos: this._extra_infos,
      tree: this._article_tree
    }
  }

  get tree() {
    return this._article_tree
  }

  // 将文本按照行进行拆解
  _readLine(text: string) {
    return text.toString().split('\r\n')
  }

  /**
   * Start Start Machine
   * 它将对文本进行逐行输入到状态机
  */
  executeInput(): void {
    // Take a single line as a single input
    // Each input has three tasks: calculation state, state transition and running task.
    this._linesArray.forEach(
      (line) => {
        this._count_new_state(line);
        this._enter_new_state(line)
        this._run_actions(line);
      }
    )
    let tree = new AST_FSM(this._article_lines, 1);
    tree.executeInput()
    this._article_tree = tree.tree;
  }

  /**The first paragraph: Determine the new status */
  _count_new_state(input: string) {
    switch (this._state) {
      case STATES_MAIN.IDLE: this._whichNextAt_IDLE(input); break;
      case STATES_MAIN.Author: this._whichNextAt_ARTICLE_INFOS(input); break;
      case STATES_MAIN.Title: this._whichNextAt_ARTICLE_INFOS(input); break;
      case STATES_MAIN.SubTitle: this._whichNextAt_ARTICLE_INFOS(input); break;
      case STATES_MAIN.LastArticle: this._whichNextAt_ARTICLE_INFOS(input); break;
      case STATES_MAIN.NextArticle: this._whichNextAt_ARTICLE_INFOS(input); break;
      case STATES_MAIN.Summary: this._whichNextAt_ARTICLE_INFOS(input); break;
      case STATES_MAIN.Article: this._whichNextAt_ARTICLE_INFOS(input); break;
      default: console.error(`[UNKNOWN STATE]: ${this._state}`);
    }
  }

  /**The second paragraph: Complete the state transition and perform the operation of the new state. */
  private _enter_new_state(line: string) {
    if (this._next_state != null && this._state !== this._next_state) {
      this._state = this._next_state;
    }
  }

  /**The third paragraph: Perform the operation in the new state. */
  private _run_actions(input: string) {
    switch (this._state) {
      case STATES_MAIN.IDLE: this._action_IDLE(input); break;
      case STATES_MAIN.Author: this._whichNextAt_Author(input); break;
      case STATES_MAIN.Title: this._whichNextAt_Title(input); break;
      case STATES_MAIN.SubTitle: this._whichNextAt_SubTitle(input); break;
      case STATES_MAIN.LastArticle: this._whichNextAt_LastArticle(input); break;
      case STATES_MAIN.NextArticle: this._whichNextAt_NextArticle(input); break;
      case STATES_MAIN.Summary: this._whichNextAt_Summary(input); break;
      case STATES_MAIN.Article: this._action_Article(input); break;
    }
  }

  /* ********************************* Sub-method of Argument 1 (Determine new status) ********************************* */
  /**Transformation logic in IDLE state */
  private _whichNextAt_IDLE(input: string) {

    if (/^#title /.test(input)) {
      this._next_state = STATES_MAIN.Title;
    }
    else if (/^##title /.test(input)) {
      this._next_state = STATES_MAIN.SubTitle;
    }
    else if (/^#author /.test(input)) {
      this._next_state = STATES_MAIN.Author;
    }
    else if (/^#last /.test(input)) {
      this._next_state = STATES_MAIN.LastArticle;
    }
    else if (/^#next /.test(input)) {
      this._next_state = STATES_MAIN.NextArticle;
    }
    else if (/^#summary /.test(input)) {
      this._next_state = STATES_MAIN.Summary;
    }
    else {
      this._next_state = STATES_MAIN.Article;
    }
  }

  /**Transformation logic in Author state */
  private _whichNextAt_Author(input: string) { this._action_setInfo('author', input) }
  /**Transformation logic in Title state */
  private _whichNextAt_Title(input: string) { this._action_setInfo('title', input) }
  /**Transformation logic in SubTitle state */
  private _whichNextAt_SubTitle(input: string) { this._action_setInfo('subtitle', input) }
  /**Transformation logic in LastArticle state */
  private _whichNextAt_LastArticle(input: string) { this._action_setInfo('last', input) }
  /**Transformation logic in NextArticle state */
  private _whichNextAt_NextArticle(input: string) { this._action_setInfo('next', input) }
  /**Transformation logic in Summary state */
  private _whichNextAt_Summary(input: string) { this._action_setInfo('summary', input) }

  /**Transformation logic shared by some states. */
  private _whichNextAt_ARTICLE_INFOS(input: string) {

    if (input.startsWith('#title ')) {
      this._next_state = STATES_MAIN.Title;
    }
    else if (input.startsWith('##title ')) {
      this._next_state = STATES_MAIN.SubTitle;
    }
    else if (input.startsWith('#author ')) {
      this._next_state = STATES_MAIN.Author;
    }
    else if (input.startsWith('#last ')) {
      this._next_state = STATES_MAIN.LastArticle;
    }
    else if (input.startsWith('#next ')) {
      this._next_state = STATES_MAIN.NextArticle;
    }
    else if (input.startsWith('#summary')) {
      this._next_state = STATES_MAIN.Summary;
    }
    else {
      this._next_state = STATES_MAIN.Article;
    }
  }

  /* ********************************* Sub-method of Argument 3 (Perform new status actions) ********************************* */
  private _action_IDLE(input: string) {
    // logger.debug(`Action: Starting from the idle state!`)
  }

  private _action_setInfo(infoType: string, input: string) {
    const _ = input.split(' ');
    switch (infoType) {
      case 'author':
        if (_.length) {
          this._extra_infos.authors.push({name:_.slice(1, _.length - 2).join(' '), email:_[_.length - 2], homepage:_[_.length - 1]})  //..._.slice(1,_.length)
        }

        break;
      case 'title':
        if (_.length > 0) {
          this._extra_infos.title = _.slice(1, _.length).join('');
        } else {
          this._extra_infos.title = ''
        }
        break;
      case 'subtitle':
        if (_.length > 0) {
          this._extra_infos.subTitle = _.slice(1, _.length).join('');
        } else {
          this._extra_infos.subTitle = ''
        }
        break;
      case 'last':
        if (_.length > 0) {
          this._extra_infos.lastArticle = _.slice(1, _.length).join('');
        } else {
          this._extra_infos.lastArticle = ''
        }
        break;
      case 'next':
        if (_.length > 0) {
          this._extra_infos.nextArticle = _.slice(1, _.length).join('');
        } else {
          this._extra_infos.nextArticle = ''
        }
        break;
      case 'summary':
        if (_.length > 0) {
          this._extra_infos.summary = _.slice(1, _.length).join('');
        } else {
          this._extra_infos.summary = ''
        }
        break;

    }
  }

  private _action_Article(input: string) {
    this._article_lines.push(input)
  }
}

export {
  Parser
}