import { Alert, Grid, TextField, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form"

export default function PaymentForm(){
    const {register, formState:{errors}} = useFormContext();
    return (
        <>
        <Typography variant="h6" gutterBottom>
            Demo Payment
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          This is a demo checkout. No real payment is processed, charged, or stored.
          Use sample values only.
        </Alert>
        <form>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            id="cardName"
            {...register("cardName")}
            label="Name on demo card"
            helperText="Use any sample name"
            fullWidth
            autoComplete="off"
            placeholder="Demo User"
            variant="standard"
            error={!!errors.cardName}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            id="cardNumber"
            {...register("cardNumber")}
            label="Demo card number"
            helperText="Try 4242 4242 4242 4242"
            fullWidth
            autoComplete="off"
            placeholder="4242 4242 4242 4242"
            variant="standard"
            error={!!errors.cardNumber}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            id="expDate"
            {...register("expDate")}
            label="Demo expiry date"
            helperText="Use any future date, e.g. 12/34"
            fullWidth
            autoComplete="off"
            placeholder="12/34"
            variant="standard"
            error={!!errors.expDate}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            id="cvv"
            {...register("cvv")}
            label="Demo CVV"
            helperText="Use any 3 digits, e.g. 123"
            fullWidth
            autoComplete="off"
            placeholder="123"
            variant="standard"
            error={!!errors.cvv}
          />
        </Grid>
      </Grid>
      </form>
        </>

    )
}
