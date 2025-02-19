import * as React from "react";
import Card from "@mui/material/Card";
import { Box, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const OrderTable = ({ allOrders }) => {
  console.log("allOrders", allOrders);
  return (
    <>
      <Card
        sx={{
          boxShadow: "none",
          borderRadius: "10px",
          p: "25px 25px 20px",
          mb: "15px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            mb: "20px",
          }}
        >
          <Typography
            as="h3"
            sx={{
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            #-JVR-{allOrders?._id}
          </Typography>

          <Button
            variant="contained"
            sx={{
              textTransform: "capitalize",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "13px",
              padding: "10px 20px",
              color: "#fff !important",
            }}
          >
            <AddIcon
              sx={{ position: "relative", top: "-1px" }}
              className="mr-5px"
            />{" "}
            Invoice
          </Button>
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "none",
          }}
        >
          <Table
            sx={{ minWidth: 650 }}
            aria-label="simple table"
            className="dark-table"
          >
            <TableHead sx={{ background: "#F7FAFF" }}>
              <TableRow>
                <TableCell
                  sx={{
                    borderBottom: "1px solid #F7FAFF",
                    fontSize: "13px",
                  }}
                >
                  Product
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    borderBottom: "1px solid #F7FAFF",
                    fontSize: "13px",
                  }}
                >
                  Price
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    borderBottom: "1px solid #F7FAFF",
                    fontSize: "13px",
                  }}
                >
                  Quantity
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    borderBottom: "1px solid #F7FAFF",
                    fontSize: "13px",
                  }}
                >
                  Total Amount
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {allOrders &&
                allOrders?.cartItems?.map((item, index) => (
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell
                      sx={{
                        borderBottom: "1px solid #F7FAFF",
                        fontSize: "12px",
                        padding: "8px 10px",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src={item.productImage}
                          alt="Product Img"
                          width={50}
                          className="borderRadius10"
                        />
                        <Typography
                          sx={{
                            fontWeight: "600",
                            fontSize: "12px",
                          }}
                          className="ml-10px"
                        >
                          {item.productName}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid #F7FAFF",
                        fontSize: "12px",
                        padding: "8px 10px",
                      }}
                    >
                      {item.price}
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid #F7FAFF",
                        fontSize: "12px",
                        padding: "8px 10px",
                      }}
                    >
                      {item.quantity}
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        borderBottom: "1px solid #F7FAFF",
                        fontSize: "12px",
                        padding: "8px 10px",
                      }}
                    >
                      <b>{item.price * item.quantity}</b>
                    </TableCell>
                  </TableRow>
                ))}

              {/* For Total Amount */}
              
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                
              </TableRow>

              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell
                  align="right"
                  colSpan={3}
                  sx={{
                    borderBottom: "1px solid #F7FAFF",
                    fontSize: "12px",
                    padding: "8px 10px",
                    fontWeight: "600",
                  }}
                >
                  Shipping Charge :
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    borderBottom: "1px solid #F7FAFF",
                    fontSize: "12px",
                    padding: "8px 10px",
                    fontWeight: "600",
                  }}
                >
                  ₹ 50.00
                </TableCell>
              </TableRow>

              

              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell
                  align="right"
                  colSpan={3}
                  sx={{
                    borderBottom: "1px solid #F7FAFF",
                    fontSize: "13px",
                    padding: "8px 10px",
                    fontWeight: "600",
                    color: "#000",
                  }}
                >
                  Total (INR) :
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    borderBottom: "1px solid #F7FAFF",
                    fontSize: "13px",
                    padding: "8px 10px",
                    fontWeight: "600",
                    color: "#000",
                  }}
                >
                  ₹ {allOrders?.orderTotal}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
};

export default OrderTable;
