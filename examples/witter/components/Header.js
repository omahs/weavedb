import { Image, Box, Flex } from "@chakra-ui/react"
import Link from "next/link"
import { isNil, map } from "ramda"
import { initNDB, login, logout } from "../lib/db"
import { useEffect, useState } from "react"
function Header({
  conf,
  link,
  title,
  func,
  user,
  setUser,
  identity,
  setIdentity,
  setEditUser,
  setEditStatus,
  setEditPost,
  setReplyTo,
  type = "default",
  wide = false,
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    ;(async () => {
      if (!isNil(user)) {
        const ndb = await initNDB()
        const count = await ndb.get("counts", user.address)
        setCount(isNil(count) ? 0 : count.count)
      } else {
        setCount(0)
      }
    })()
  }, [user])

  const [userMenu, setUserMenu] = useState(false)
  const tabs = [
    { key: "edit", name: "Edit" },
    { key: "preview", name: "Preview" },
    { key: "post", name: "Post" },
  ]

  return (
    <Flex
      bg="white"
      w="100%"
      justify="center"
      height="50px"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        borderBottom: !wide ? "" : "1px solid #ccc",
      }}
    >
      <Flex
        fontSize="14px"
        w="100%"
        maxW="760px"
        align="center"
        py={2}
        px={4}
        sx={{
          borderBottom: wide ? "" : "1px solid #ccc",
          borderX: wide ? "" : "1px solid #ccc",
        }}
      >
        <Link
          href={link ?? (!isNil(user) ? `/u/${user.handle}` : "/")}
          onClick={e => {
            if (!isNil(func)) {
              e.preventDefault()
              func()
            }
          }}
        >
          <Flex
            align="center"
            sx={{
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
          >
            <Box as="i" className="fas fa-arrow-left" mr={4} />
            <Box fontSize="18px" fontWeight="bold">
              {title ?? user?.name ?? "Witter Testnet"}
            </Box>
          </Flex>
        </Link>
        <Box flex={1} />
        {isNil(user) ? (
          <Box
            onClick={async () => {
              const { user, identity } = await login()
              if (!isNil(identity)) {
                setIdentity(identity)
                if (isNil(user)) {
                  setEditUser(true)
                } else {
                  setUser(user)
                }
              }
            }}
            mx={2}
            sx={{
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
          >
            Sign In
          </Box>
        ) : (
          <>
            {type === "default" ? (
              <Box
                onClick={() => setEditPost(true)}
                mx={2}
                sx={{
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                New Post
              </Box>
            ) : (
              <>
                {map(v => {
                  return (
                    <Box
                      onClick={async () => conf.setTab(v.key)}
                      mx={2}
                      sx={{
                        cursor: "pointer",
                        ":hover": { opacity: 0.75 },
                        textDecoration: v.key === conf.tab ? "underline" : "",
                      }}
                    >
                      {v.name}
                    </Box>
                  )
                })(tabs)}
              </>
            )}
            <Link href="/notifications">
              <Box
                mx={2}
                sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
              >
                <Flex
                  bg={count > 0 ? "#1D9BF0" : "#999"}
                  boxSize="30px"
                  sx={{ borderRadius: "50%", position: "relative" }}
                  justify="center"
                  align="center"
                >
                  <Box as="i" className="fas fa-bell" color="white" />
                  {count > 0 ? (
                    <Box
                      fontSize="10px"
                      sx={{
                        borderRadius: "3px",
                        position: "absolute",
                        bottom: "-5px",
                        left: "22px",
                      }}
                      px={1}
                      bg="crimson"
                      color="white"
                    >
                      {count}
                    </Box>
                  ) : null}
                </Flex>
              </Box>
            </Link>
            {!userMenu ? null : (
              <>
                <Box mx={2} color="#ccc">
                  |
                </Box>
                <Box
                  onClick={async () => {
                    if (confirm("Would you like to sign out?")) {
                      setUser(null)
                      logout()
                    }
                  }}
                  mx={2}
                  sx={{
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                >
                  Sign Out
                </Box>
              </>
            )}
            <Image
              onClick={() => setUserMenu(!userMenu)}
              src={user.image ?? "/images/default-icon.png"}
              boxSize="30px"
              ml={2}
              sx={{
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
                borderRadius: "50%",
              }}
            />
          </>
        )}
      </Flex>
    </Flex>
  )
}
export default Header
