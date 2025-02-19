import * as React from "react";
import { Box } from "@mui/material";
import Card from "@mui/material/Card";
import { Typography } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import { useDispatch, useSelector } from "react-redux";
import { getOrders } from "@/utils/OrdersSlice";
import { current } from "@reduxjs/toolkit";
import { useState } from "react";
import SearchForm from "@/components/_App/TopNavbar/SearchForm";
import Preloader from "@/components/Loader/PreLoader";

function OrdersList(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };


  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

OrdersList.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

function createData(
  orderID,
  productImg,
  productTitle,
  customer,
  price,
  vendor,
  date,
  status,
  badgeClass,
  rating
) {
  return {
    orderID,
    productImg,
    productTitle,
    customer,
    price,
    vendor,
    date,
    status,
    badgeClass,
    rating,
  };
}

const rows = [
  createData(
    "#SK258",
    "/images/product1.png",
    "Laptop Macos Pro",
    "Colin Firth",
    "$289.50",
    "Boetic Fashion",
    "2021-12-19",
    "Delivered",
    "successBadge",
    "5.0 (61 votes)"
  ),
].sort((a, b) => (a.orderID < b.orderID ? -1 : 1));

export default function OrdersLists({
  orders,
  setCurrentPage,
  currentPage,
  totalPages,
  setSelected,
  setSearchQuery,
  searchQuery,
  loading,
  error,
}) {
  // Select
  const [select, setSelect] = React.useState("");
  const handleChange = (event) => {
    setSelect(event.target.value);
    setSelected(event.target.value);
    console.log(event.target.value);
  };

  // Table
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <Card
        sx={{
          boxShadow: "none",
          borderRadius: "10px",
          p: "25px 25px 10px",
          mb: "15px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "10px",
          }}
        >
          <Typography
            as="h3"
            sx={{
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            Recent Orders
          </Typography>

         
          <Box>
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel id="demo-select-small" sx={{ fontSize: "14px" }}>
                Select
              </InputLabel>
              <Select
                labelId="demo-select-small"
                id="demo-select-small"
                value={select}
                label="Select"
                onChange={handleChange}
                sx={{ fontSize: "14px" }}
              >
                <MenuItem value={"All"} sx={{ fontSize: "14px" }}>
                  All
                </MenuItem>
                <MenuItem value={"Processing"} sx={{ fontSize: "14px" }}>
                  Processing
                </MenuItem>
                <MenuItem value={"Packed"} sx={{ fontSize: "14px" }}>
                  Packed
                </MenuItem>
                <MenuItem value={"Dispatched"} sx={{ fontSize: "14px" }}>
                  Dispatched
                </MenuItem>
                {/* <MenuItem value={3}>Last 12 Months</MenuItem> */}
                <MenuItem value={"Delivered"} sx={{ fontSize: "14px" }}>
                  Delivered
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "none",
          }}
        >
          <Table
            sx={{ minWidth: 950 }}
            aria-label="custom pagination table"
            className="dark-table"
          >
            <TableHead sx={{ background: "#F7FAFF" }}>
              <TableRow>
                <TableCell
                  sx={{
                    borderBottom: "1px solid #F7FAFF",
                    fontSize: "13.5px",
                    padding: "16px 10px",
                  }}
                >
                  Order ID
                </TableCell>

                <TableCell
                  sx={{
                    borderBottom: "1px solid #F7FAFF",
                    fontSize: "13.5px",
                    padding: "16px 10px",
                  }}
                >
                  Product
                </TableCell>

                <TableCell
                  sx={{
                    borderBottom: "1px solid #F7FAFF",
                    fontSize: "13.5px",
                    padding: "16px 10px",
                  }}
                >
                  Customer Name
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    borderBottom: "1px solid #F7FAFF",
                    fontSize: "13.5px",
                    padding: "16px 10px",
                  }}
                >
                  Price
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    borderBottom: "1px solid #F7FAFF",
                    fontSize: "13.5px",
                    padding: "16px 10px",
                  }}
                >
                  Payment Type / Status
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    borderBottom: "1px solid #F7FAFF",
                    fontSize: "13.5px",
                    padding: "16px 10px",
                  }}
                >
                  Ordered Date
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    borderBottom: "1px solid #F7FAFF",
                    fontSize: "13.5px",
                    padding: "16px 10px",
                  }}
                >
                  Status
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    borderBottom: "1px solid #F7FAFF",
                    fontSize: "13.5px",
                    padding: "16px 10px",
                  }}
                >
                  Color / Size
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Check for error */}
              {error ? (
                <TableRow
                  sx={{ "& td": { padding: "6px 8px", fontSize: "13px" } }}
                >
                  <TableCell
                    colSpan={8} // Ensure the error message spans the entire table width
                    sx={{
                      fontWeight: 500,
                      borderBottom: "1px solid #F0F4F8",
                      textAlign: "center",
                    }}
                  >
                    No Orders Found
                  </TableCell>
                </TableRow>
              ) : // If there is no error, check if there are orders
              orders?.length > 0 ? (
                orders.map((row) => (
                  <TableRow
                    key={row._id}
                    sx={{ "& td": { padding: "6px 8px", fontSize: "13px" } }}
                  >
                    <TableCell
                      sx={{
                        width: 90,
                        fontWeight: 500,
                        borderBottom: "1px solid #F0F4F8",
                      }}
                    >
                      {row._id}
                    </TableCell>

                    <TableCell
                      sx={{ width: 250, borderBottom: "1px solid #F0F4F8" }}
                    >
                      {row.cartItems?.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "6px",
                          }}
                        >
                          <a target="_blank" href={item.productImage}>
                            <img
                              src={item.productImage}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "4px",
                              }}
                              alt="Product"
                            />
                          </a>
                          <a
                            href={`/ecommerce/orderDetails/${row._id}`}
                            style={{
                              textDecoration: "none",
                              color: "#333",
                              fontSize: "13px",
                              fontWeight: "500",
                            }}
                          >
                            {item.productName}
                          </a>
                        </div>
                      ))}
                    </TableCell>

                    <TableCell sx={{ borderBottom: "1px solid #F0F4F8" }}>
                      {row.shippingAddress?.fullName}
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{ borderBottom: "1px solid #F0F4F8" }}
                    >
                      {row.cartItems?.map((item, index) => (
                        <div key={index} style={{ marginBottom: "6px" }}>
                          {item.price}
                        </div>
                      ))}
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{ borderBottom: "1px solid #F0F4F8" }}
                    >
                      {row.paymentDetails?.method} /{" "}
                      {row.paymentDetails?.status}
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{ borderBottom: "1px solid #F0F4F8" }}
                    >
                      <span>
                        {new Date(row.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 500,
                        borderBottom: "1px solid #F0F4F8",
                      }}
                    >
                      <span
                        className={row.badgeClass}
                        style={{
                          color:
                            row.orderStatus === "Delivered"
                              ? "#28a745"
                              : row.orderStatus === "Processing"
                              ? "#ffc107"
                              : row.orderStatus === "Packed"
                              ? "#17a2b8"
                              : row.orderStatus === "Dispatched"
                              ? "#007bff"
                              : "#333",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        {row.orderStatus}
                      </span>
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ borderBottom: "1px solid #F0F4F8" }}
                    >
                      {row.cartItems?.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "6px",
                            justifyContent: "flex-end",
                            marginBottom: "6px",
                          }}
                        >
                          <div
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "2px",
                              backgroundColor: item.color,
                            }}
                          />
                          <div>/ {item.size}</div>
                        </div>
                      ))}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // If no orders are found
                <TableRow
                  sx={{ "& td": { padding: "6px 8px", fontSize: "13px" } }}
                >
                  <TableCell
                    colSpan={8}
                    sx={{
                      fontWeight: 500,
                      borderBottom: "1px solid #F0F4F8",
                      textAlign: "center",
                    }}
                  >
                    No Orders found 🤷‍♂️
                  </TableCell>
                </TableRow>
              )}

              {/* Render empty rows if necessary */}
              {emptyRows > 0 && (
                <TableRow style={{ height: 50 * emptyRows }}>
                  <TableCell
                    colSpan={8}
                    style={{ borderBottom: "1px solid #F0F4F8" }}
                  />
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  colSpan={8}
                  count={totalPages * 10} // Multiply by rows per page to get total count
                  rowsPerPage={10}
                  page={currentPage}
                  onPageChange={handleChangePage}
                  SelectProps={{
                    inputProps: { "aria-label": "rows per page" },
                    native: true,
                  }}
                  style={{ borderBottom: "none" }}
                  rowsPerPageOptions={[10]}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
}
