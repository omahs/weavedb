import { Image, Input, Textarea, Box, Flex } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { updateProfile } from "../lib/db"
import { isNil, assoc } from "ramda"
export default function EditUser({
  editUser,
  setEditUser,
  setPuser,
  identity,
  setUser,
  user,
}) {
  const [handle, setHandle] = useState("")
  const [name, setName] = useState("")
  const [intro, setIntro] = useState("")
  const [icon, setIcon] = useState(null)
  const [coverIcon, setCoverIcon] = useState(null)
  const [taken, setTaken] = useState({})
  const [updating, setUpdating] = useState(false)
  useEffect(() => {
    if (!isNil(user)) {
      setHandle(user.handle ?? "")
      setName(user.name ?? "")
      setIntro(user.description ?? "")
    } else {
      setHandle("")
      setName("")
      setIntro("")
    }
    setIcon(null)
    setCoverIcon(null)
  }, [user])
  const ok =
    isNil(taken[handle.toLowerCase()]) &&
    handle.length >= 2 &&
    name.length > 0 &&
    !updating

  return !editUser ? null : (
    <Flex
      h="100%"
      w="100%"
      bg="rgba(0,0,0,0.5)"
      sx={{ position: "fixed", top: 0, left: 0 }}
      align="center"
      justify="center"
    >
      <Box
        onClick={e => e.stopPropagation()}
        bg="white"
        m={4}
        maxW="500px"
        width="100%"
        sx={{ borderRadius: "5px" }}
        fontSize="14px"
      >
        {isNil(user) ? null : (
          <Flex fontSize="18px" justify="flex-end" mx={4} mt={2} mb="-15px">
            <Box
              onClick={() => setEditUser(false)}
              sx={{
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
            >
              x
            </Box>
          </Flex>
        )}
        <Box px={4} pb={4} pt={isNil(user) ? 4 : 0}>
          <Flex fontSize="24px" justify="center" fontWeight="bold" mb={2}>
            {isNil(user) ? "Create Account" : "Update Profile"}
          </Flex>
          <Flex justify="center" fontSize="12px">
            {identity.signer}
          </Flex>
          <Flex align="center">
            <Box p={3}>
              <Image
                src={icon ?? user?.image ?? "/images/default-icon.png"}
                boxSize="60px"
                sx={{ borderRadius: "50px" }}
              />
            </Box>
            <Box flex={1}>
              <Box fontSize="12px" mx={1} mb={1}>
                Avatar Image (square)
              </Box>
              <Box>
                <Input
                  p={1}
                  accept=".jpg,.png,.jpeg"
                  type="file"
                  onChange={async e => {
                    if (!isNil(e.target.files[0])) {
                      const {
                        readAndCompressImage,
                      } = require("browser-image-resizer")
                      const file = await readAndCompressImage(
                        e.target.files[0],
                        {
                          maxWidth: 300,
                          maxHeight: 300,
                          mimeType: e.target.files[0].type,
                        }
                      )
                      let reader = new FileReader()
                      reader.readAsDataURL(file)
                      reader.onload = () => setIcon(reader.result)
                    }
                  }}
                />
              </Box>
            </Box>
          </Flex>
          <Box fontSize="12px" mx={1} mb={1}>
            User Handle ( 2-15 characters )
          </Box>
          <Box>
            <Input
              disabled={!isNil(user)}
              placeholder="0-9a-z_"
              value={handle}
              color={taken[handle.toLowerCase()] ? "crimson" : ""}
              onChange={e => {
                if (
                  e.target.value.length <= 15 &&
                  /^[a-z0-9_]*$/i.test(e.target.value)
                ) {
                  setHandle(e.target.value)
                }
              }}
            />
          </Box>
          <Box fontSize="12px" mx={1} mt={3} mb={1}>
            Name ( 50 characters )
          </Box>
          <Box>
            <Input
              placeholder="name"
              value={name}
              onChange={e => {
                if (e.target.value.length <= 50) setName(e.target.value)
              }}
            />
          </Box>
          <Box fontSize="12px" mx={1} mt={3} mb={1}>
            Intro ( 140 characters )
          </Box>
          <Box>
            <Textarea
              placeholder="intro"
              value={intro}
              onChange={e => {
                if (e.target.value.length < 140) setIntro(e.target.value)
              }}
            />
          </Box>
          <Flex align="center" mt={3}>
            <Box p={3}>
              <Image
                src={
                  coverIcon ??
                  user?.cover ??
                  `https://picsum.photos/800/200?id=${Date.now()}`
                }
                height="45px"
                width="180px"
              />
            </Box>
            <Box flex={1}>
              <Box fontSize="12px" mx={1} mb={1}>
                Cover Image (4 : 1)
              </Box>
              <Box>
                <Input
                  p={1}
                  accept=".jpg,.png,.jpeg"
                  type="file"
                  onChange={async e => {
                    if (!isNil(e.target.files[0])) {
                      const {
                        readAndCompressImage,
                      } = require("browser-image-resizer")
                      const file = await readAndCompressImage(
                        e.target.files[0],
                        {
                          maxWidth: 800,
                          maxHeight: 800,
                          mimeType: e.target.files[0].type,
                        }
                      )
                      let reader = new FileReader()
                      reader.readAsDataURL(file)
                      reader.onload = () => setCoverIcon(reader.result)
                    }
                  }}
                />
              </Box>
            </Box>
          </Flex>
          <Box mt={4}>
            <Flex
              bg={ok ? "#333" : "#ccc"}
              color="white"
              w="100%"
              justify="center"
              align="center"
              p={2}
              sx={{
                borderRadius: "5px",
                cursor: ok ? "pointer" : "default",
                ":hover": { opacity: 0.75 },
              }}
              onClick={async () => {
                if (ok) {
                  setUpdating(true)
                  try {
                    const { err, user: _user } = await updateProfile({
                      name,
                      handle,
                      intro,
                      image: icon,
                      cover: coverIcon,
                      address: identity.signer,
                      user,
                    })
                    if (err === "handle") {
                      alert("Handle is taken")
                      setTaken(assoc(handle.toLowerCase(), true, taken))
                    }
                    if (isNil(err)) {
                      setUser(_user)
                      if (!isNil(setPuser)) setPuser(_user)
                      setEditUser(false)
                    }
                  } catch (e) {
                    console.log(e)
                  }
                  setUpdating(false)
                }
              }}
            >
              {updating ? (
                <Box
                  as="i"
                  className="fas fa-circle-notch fa-spin"
                  mr={2}
                  ml="-22px"
                  mb="2px"
                />
              ) : null}
              {isNil(user) ? "Create Account" : "Update Profile"}
            </Flex>
          </Box>
        </Box>
      </Box>
    </Flex>
  )
}
