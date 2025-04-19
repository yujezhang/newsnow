export default defineSource(async () => {
  // 1) fetch the RSS
  const xml = await fetch("https://www.theguardian.com/world/rss")
    .then(r => r.text())

  // 2) split into <item>
  const itemsRaw = xml.split("<item>").slice(1)

  function extract(tag: string, str: string): string {
    const re = new RegExp(
      `<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`,
      "i",
    )
    const m = str.match(re)
    return m ? m[1].trim() : ""
  }

  // 3) map into NewsItem
  return itemsRaw.map((block) => {
    const title = extract("title", block)
    const link = extract("link", block)
    const guid = extract("guid", block) || link
    const pubText = extract("pubDate", block)
    const pubDate = pubText ? new Date(pubText).getTime() : Date.now()
    const desc = extract("description", block)

    return {
      id: guid,
      title,
      url: link,
      pubDate,
      extra: {
        date: pubText,
        hover: desc,
      },
    }
  })
})
