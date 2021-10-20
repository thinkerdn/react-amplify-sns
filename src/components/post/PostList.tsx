import React, { useEffect, useState } from "react"

import API, { graphqlOperation } from "@aws-amplify/api"

import { Theme } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import RotateRightIcon from "@mui/icons-material/RotateRight"
import AutorenewIcon from "@mui/icons-material/Autorenew"

import PostForm from "./PostForm"
import PostItem from "./PostItem"

import { listPostsSortedByCreatedAt } from "../../graphql/queries"
import { onCreatePost, onDeletePost } from "../../graphql/subscriptions"

import { 
  Post,
  ListPostsSortedByCreatedAtQuery,
  OnCreatePostSubscriptionData,
  OnDeletePostSubscriptionData
} from "../../types/index"

const useStyles = makeStyles((theme: Theme) => ({
  box: {
    marginTop: "2rem",
    width: 320
  }
}))

const PostList: React.FC = () => {
  const classes = useStyles()

  const [loading, setLoading] = useState<boolean>(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [nextToken, setNextToken] = useState<string | null | undefined>(null)

  const getPosts = async () => {
    const result = await API.graphql({
      query: listPostsSortedByCreatedAt,
      variables: {
        status: "published",
        sortDirection: "DESC",
        limit: 5, // 一度のリクエストで取得可能な件数（この辺はお好みで）
        nextToken: nextToken
      }
    })

    if ("data" in result && result.data) {
      const data = result.data as ListPostsSortedByCreatedAtQuery
      if (data.listPostsSortedByCreatedAt) {
        setPosts(data.listPostsSortedByCreatedAt.items as Post[])
        setNextToken(data.listPostsSortedByCreatedAt.nextToken)
      }
    }
  }

  // 追加で投稿(Post)を取得するための関数（ページネーション）
  const loadMore = async () => {
    setLoading(true)

    const result = await API.graphql({
      query: listPostsSortedByCreatedAt,
      variables: {
        status: "published",
        sortDirection: "DESC",
        limit: 5,
        nextToken: nextToken
      }
    })

    if ("data" in result && result.data) {
      const data = result.data as ListPostsSortedByCreatedAtQuery
      if (data.listPostsSortedByCreatedAt) {
        const items = data.listPostsSortedByCreatedAt.items as Post[]
        setPosts((prev) => [...prev, ...items])
        setNextToken(data.listPostsSortedByCreatedAt.nextToken)
      }
    }

    setLoading(false)
  }

  // subscribe = データ変更情報をリアルタイムで取得・反映
  const subscribeCreatedPost = () => {
    const client = API.graphql(graphqlOperation(onCreatePost))

    if ("subscribe" in client) {
      client.subscribe({
        next: ({ value: { data } }: OnCreatePostSubscriptionData) => {
          if (data.onCreatePost) {
            const createdPost: Post = data.onCreatePost
            setPosts((prev) => [createdPost, ...prev])
          }
        }
      })
    }
  }

  const subscribeDeletedPost = () => {
    const client = API.graphql(graphqlOperation(onDeletePost))

    if ("subscribe" in client) {
      client.subscribe({
        next: ({ value: { data } }: OnDeletePostSubscriptionData) => {
          if (data.onDeletePost) {
            const deletedPost: Post = data.onDeletePost
            setPosts((prev) => prev.filter(post => post.id !== deletedPost.id))
          }
        }
      })
    }
  }

  useEffect(() => {
    getPosts()
    subscribeCreatedPost()
    subscribeDeletedPost()
  }, [])

  return (
    <>
      <PostForm />
      { posts?.map((post: Post) => {
        return (
          <PostItem
            key={post.id}
            post={post}
          />
        )}
      )}
      { nextToken !== null ?
        <Box
          className={classes.box}
          textAlign="center"
        >
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={loading ? <RotateRightIcon /> : <AutorenewIcon />}
            onClick={loadMore}
          >
            { loading ? "Now loading..." : "Load More..." }
          </Button>
        </Box> : null
      }
    </>
  )
}

export default PostList