import { Container, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Header from "./Header";
import { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { getBasketFromLocalStorage } from "../util/util";
import { useAppDispatch } from "../store/configureStore";
import { fetchCurrentUser } from "../../features/account/accountSlice";
import agent from "../api/agent";
import { setBasket } from "../../features/basket/basketSlice";
import Spinner from "./Spinner";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const paletteType = darkMode ? 'dark' : 'light';
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const basket = getBasketFromLocalStorage();
    dispatch(fetchCurrentUser());
    if(basket){
      agent.Basket.get()
      .then(basket=>dispatch(setBasket(basket)))
      .catch(error=>console.log(error))
      .finally(()=>setLoading(false))
    }else{
      setLoading(false);
    }
  }, [dispatch])

  const theme = useMemo(() => createTheme({
    palette:{
      mode:paletteType,
      primary: {
        main: paletteType === 'dark' ? '#6fd6ad' : '#0f5c4d',
      },
      secondary: {
        main: '#f97316',
      },
      background: {
        default: paletteType === 'dark' ? '#081612' : '#f7f4ed',
        paper: paletteType === 'dark' ? '#10211d' : '#ffffff',
      }
    },
    shape: {
      borderRadius: 18,
    },
    typography: {
      h1: {
        fontWeight: 800,
        lineHeight: 1.05,
      },
      h2: {
        fontWeight: 800,
        lineHeight: 1.08,
      },
      h4: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 700,
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            textTransform: 'none',
            paddingInline: 18
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24
          }
        }
      }
    }
  }), [paletteType]);

  function handleThemeChange(){
    setDarkMode(!darkMode);
  }
  if(loading)return <Spinner message="Getting Basket..."/>
  return (
    <ThemeProvider theme={theme}>
      <ToastContainer position="bottom-right" hideProgressBar theme="colored"/>
    <CssBaseline/>
    <Header darkMode={darkMode} handleThemeChange={handleThemeChange}/>
    <Container maxWidth="xl" sx={{ paddingTop: { xs: "88px", md: "104px" }, paddingBottom: 6 }}>
      <Outlet/>
    </Container>
    </ThemeProvider>
  )
}

export default App
