import { Box, Flex } from "@chakra-ui/react"
import { keys, compose, map, cron, isNil } from "ramda"
import JSONPretty from "react-json-pretty"
import { inject } from "roidjs"
import { queryDB } from "../lib/weavedb"

export default inject(
  [],
  ({ setAddCron, crons, setCron, _cron, fn, contractTxId, db, setState }) => (
    <>
      <Flex flex={1} sx={{ border: "1px solid #555" }} direction="column">
        <Flex py={2} px={3} color="white" bg="#333" h="35px">
          Crons
          <Box flex={1} />
          <Box
            onClick={() => setAddCron(true)}
            sx={{
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
          >
            <Box as="i" className="fas fa-plus" />
          </Box>
        </Flex>
        <Box height="500px" sx={{ overflowY: "auto" }}>
          {compose(
            map(v => (
              <Flex
                onClick={() => {
                  setCron(v)
                }}
                bg={cron === v ? "#ddd" : ""}
                py={2}
                px={3}
                sx={{
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                <Box mr={3} flex={1}>
                  {v}
                </Box>
                <Box
                  color="#999"
                  sx={{
                    cursor: "pointer",
                    ":hover": {
                      opacity: 0.75,
                      color: "#6441AF",
                    },
                  }}
                  onClick={async e => {
                    e.stopPropagation()
                    let query = `"${v}"`
                    if (confirm("Would you like to remove the cron?")) {
                      const res = await fn(queryDB)({
                        method: "removeCron",
                        query,
                        contractTxId,
                      })
                      if (/^Error:/.test(res)) {
                        alert("Something went wrong")
                      }
                      setState(await db.getInfo(true))
                    }
                  }}
                >
                  <Box as="i" className="fas fa-trash" />
                </Box>
              </Flex>
            )),
            keys
          )(crons.crons || [])}
        </Box>
      </Flex>
      <Flex flex={1} sx={{ border: "1px solid #555" }} direction="column">
        <Flex py={2} px={3} color="white" bg="#333" h="35px">
          Settings
          <Box flex={1} />
        </Flex>
        <Box height="500px" sx={{ overflowY: "auto" }}>
          {isNil(_cron) ? null : (
            <>
              <Flex align="center" p={2} px={3}>
                <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                  Name
                </Box>
                <Box flex={1}>{cron}</Box>
              </Flex>
              <Flex align="center" p={2} px={3}>
                <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                  Start
                </Box>
                <Box flex={1}>{_cron.start}</Box>
              </Flex>
              <Flex align="center" p={2} px={3}>
                <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                  End
                </Box>
                <Box flex={1}>{_cron.end || "-"}</Box>
              </Flex>
              <Flex align="center" p={2} px={3}>
                <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                  Do
                </Box>
                <Box flex={1}>{_cron.do ? "true" : "false"}</Box>
              </Flex>
              <Flex align="center" p={2} px={3}>
                <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                  Span
                </Box>
                <Box flex={1}>{_cron.span}</Box>
              </Flex>
              <Flex align="center" p={2} px={3}>
                <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                  Times
                </Box>
                <Box flex={1}>{_cron.times || "-"}</Box>
              </Flex>
            </>
          )}
        </Box>
      </Flex>
      <Flex flex={1} sx={{ border: "1px solid #555" }} direction="column">
        <Flex py={2} px={3} color="white" bg="#333" h="35px">
          Jobs
        </Flex>
        <Box height="500px" sx={{ overflowY: "auto" }} p={3}>
          {isNil(_cron) ? null : (
            <JSONPretty id="json-pretty" data={_cron.jobs}></JSONPretty>
          )}
        </Box>
      </Flex>
    </>
  )
)