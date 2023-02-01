const TEMPLATES = {
    author: (author: string[]) => {
      return `<b>作者：<a href="${author[1]}">${author[0]}</a></b><br><b>邮箱：<a href="mailto:${author[2]}">${author[2]}</a></b>`
    },
    title: (title: string, subtitle: string | undefined) => {
      if (subtitle) {
        return `<center><font size=6 color="green"><b>${title}</b></font></center><br><center><font size=5 color="green"><b>${subtitle}</b></font></center><hr>`
      } else {
        return `<center><font size=6 color="green"><b>${title}</b></font></center><hr>`
      }
  
    },
    summary: (summary: string) => {
      return `<fieldset><legend>摘要</legend>${summary}</fieldset>`
    },
    lastAndNext: (last: string, next: string) => {
      const l = last.match(/\[(.+?)\]\((.+?)\)/) as RegExpMatchArray
      const n = next.match(/\[(.+?)\]\((.+?)\)/) as RegExpMatchArray
      return `<center><font color="blue"><b>上一节：《<a href="${l[2]}"><font color="green">${l[1]}</font></a></b>》</font><b> | </b>  <font color="blue"><b>下一节：《<a href="${n[2]}"><font color="green"> ${n[1]}</font></a></b>》</font></center>`
    },
  }