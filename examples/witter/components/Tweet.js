import Link from "next/link"
import { isNil } from "ramda"
import Embed from "./Embed"

function Tweet({
  reposted = false,
  setRetweet,
  user,
  likes = {},
  setLikes,
  _tweet,
  setTweet,
  body,
  tweet,
  users,
  tweets = {},
  isLink = true,
  list = true,
  reply = false,
  repost = null,
  parent,
}) {
  const content = (
    <Embed
      {...{
        reposted,
        setRetweet,
        user,
        likes,
        _tweet,
        setLikes,
        setTweet,
        body,
        tweet,
        users,
        tweets,
        list,
        reply,
        repost,
        parent,
      }}
    />
  )
  const embed = <Link href={`/s/${tweet.id}`}>{content}</Link>

  const pr = isNil(parent) ? null : (
    <Embed
      {...{
        embed,
        likes,
        reposted: false,
        users,
        tweets,
        setRetweet,
        tweet: {
          cover: parent.cover,
          id: parent.id,
          date: parent.date,
          user: parent.owner,
          reposts: parent.reposts,
          likes: parent.likes,
          comments: parent.comments,
          reply_to: "",
          body: parent.description,
        },
        repost: null,
        reply: false,
      }}
    />
  )
  return isNil(parent) ? embed : pr
}

export default Tweet
