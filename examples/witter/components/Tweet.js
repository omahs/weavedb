import Link from "next/link"
import { isNil } from "ramda"
import Embed from "./Embed"
import { Flex, Box } from "@chakra-ui/react"
function Tweet({
  delTweet,
  reposted = false,
  setRetweet,
  user = {},
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
  disabled = false,
  main = false,
  setEditRepost,
  setShowLikes,
  setShowReposts,
}) {
  const content = (
    <Embed
      {...{
        delTweet,
        setShowReposts,
        setShowLikes,
        setEditRepost,
        main: isNil(parent) ? main : false,
        disabled: isNil(parent) ? disabled : false,
        isLink: isNil(parent) ? isLink : true,
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
  const embed =
    isLink || !isNil(parent) ? (
      <Link href={`/s/${tweet.id}`}>{content}</Link>
    ) : (
      content
    )
  const pr = isNil(parent) ? null : (
    <Embed
      {...{
        delTweet,
        setShowReposts,
        setShowLikes,
        setEditRepost,
        main,
        user,
        disabled,
        isLink,
        embed,
        likes,
        reposted: false,
        users,
        tweets,
        setLikes,
        setTweet,
        likes,
        reposted,
        setRetweet,
        tweet: parent,
        repost: null,
        reply: false,
      }}
    />
  )
  return isNil(parent) ? (
    embed
  ) : isLink ? (
    <Link href={`/s/${parent.id}`}>{pr}</Link>
  ) : (
    pr
  )
}

export default Tweet
