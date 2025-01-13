import BugReportIcon from '@mui/icons-material/BugReport';
import { Box, Link as MuiLink, Theme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router';

const PageNotFoundComponent = () => {
  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <BugReportIcon
          sx={{
            width: '10vw',
            height: '10vw',
            color: (theme: Theme) => theme.colours?.blue,
          }}
        />
        <Typography
          sx={{
            fontWeight: 'bold',
            fontSize: '10vw',
            color: (theme: Theme) => theme.colours?.blue,
          }}
        >
          404
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <Typography variant="h2" sx={{ color: 'text.primary' }}>
          Page not found
        </Typography>
        <Typography
          variant="body1"
          sx={{
            padding: '15px',
            maxWidth: '600px',
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          We&#39;re sorry, the page you requested was not found on the server.
          If you entered the URL manually please check your spelling and try
          again. Otherwise, return to the{' '}
          <MuiLink
            component={Link}
            sx={{ color: (theme: Theme) => theme.palette.text.primary }}
            to="/"
          >
            home page
          </MuiLink>{' '}
          .
        </Typography>
      </Box>
    </div>
  );
};

export default PageNotFoundComponent;
