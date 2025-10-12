import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Link from 'next/link';
import styles from '@/styles/PageTitle.module.css';
import { useGetAllProductsQuery, useDeleteProductMutation } from "@/utils/api/ProductsApi";
import Preloader from "@/components/Loader/PreLoader";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { toast } from "react-toastify"; // or use your notification system

export default function Products() {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const { data: products, isLoading } = useGetAllProductsQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const handleUpdateClick = (id) => {
    router.push(`/ecommerce/updateProduct/${id}`);
  };

  const handleDetailedViewClick = (id) => {
    router.push(`/ecommerce/productDetails/${id}`);
  };

  const handleDeleteClick = (id) => {
    setSelectedProductId(id);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteProduct(selectedProductId).unwrap();
      toast.success("Product deleted successfully!");
      setOpenDialog(false);
      setSelectedProductId(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error(error?.data?.message || "Failed to delete product");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProductId(null);
  };

  if (isLoading) return <Preloader />;

  return (
    <>
      {/* Page title */}
      <div className={styles.pageTitle}>
        <h1>Products</h1>
        <ul>
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>Products</li>
        </ul>
      </div>

      <Grid container spacing={3}>
        {products?.products.map((product, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                boxShadow: "none",
                borderRadius: "10px",
                p: "25px",
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Image Container */}
              <div
                onClick={() => handleDetailedViewClick(product._id)}
                style={{
                  width: "100%",
                  height: "300px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={product.productVariants?.[0]?.images[0]}
                  alt={product.productName}
                  style={{
                    width: "80%",
                    cursor: "pointer",
                    height: "100%",
                    borderRadius: "10px",
                    objectFit: "cover",
                  }}
                />
              </div>

              {/* Content Container */}
              <div style={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    mb: "10px",
                  }}
                >
                  {product.productName}
                </Typography>

                <Typography variant="body1" sx={{ mb: "10px", fontSize: "1rem" }}>
                  Category: {product.productCategory}
                </Typography>
                <Typography variant="body1" sx={{ mb: "10px", fontSize: "1rem" }}>
                  Type: {product.productType}
                </Typography>
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  marginTop: "auto",
                }}
              >
                <Button
                  variant="contained"
                  sx={{
                    textTransform: "capitalize",
                    borderRadius: "8px",
                    fontWeight: "500",
                    fontSize: "13px",
                    padding: "12px 20px",
                    color: "#fff !important",
                  }}
                  onClick={() => handleUpdateClick(product._id)}
                >
                  Update
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  sx={{
                    textTransform: "capitalize",
                    borderRadius: "8px",
                    fontWeight: "500",
                    fontSize: "13px",
                    padding: "12px 20px",
                  }}
                  onClick={() => handleDeleteClick(product._id)}
                  disabled={isDeleting}
                >
                  {isDeleting && selectedProductId === product._id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Delete"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this product? This action cannot be undone and will also delete all associated reviews.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}