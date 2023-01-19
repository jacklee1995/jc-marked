interface ArticleParams{
  title: string,
  subTitle: string,
  authors: {
    name: string,
    email: string,
    homepage:string,
  }[]
  summary: string,
  lastArticle:string,
  nextArticle:string,
}

enum STATES_MAIN {
  IDLE = "IDLE",                  // 空闲态，不需要做任何处理，即无任何输出（处理器方法），是初始态
  Author = "Author",              // 作者
  Title = "Title",                // 全文标题
  SubTitle = "SubTitle",          // 全文副标题
  LastArticle = "LastArticle",    // 上一篇文章
  NextArticle = "NextArticle",    // 下一篇文章
  Summary = "Summary",            // 下一篇文章
  Article = "Article",            // 文章

}

enum STATES_Structuretree {
  IDLE = "IDLE",                  // The idle state is the initial state. It is also used for some aftermath work in other states.
  HEADER = "HEADER",              // Represents the title of a paragraph in an article, including h1、h2、h3、h4、h5、h6
  PLAINTEXT = "PLAINTEXT",        // Represents a paragraph belonging to a header.
  CODE = "CODE"
}

export {
  ArticleParams,
  STATES_MAIN,
  STATES_Structuretree,
  
}