import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Collapse,
  IconButton,
  Button,
  CircularProgress,
  Box
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

const CompanyCard = ({ 
  company, 
  expanded, 
  onExpand, 
  onGetSummary, 
  onSaveBookmark,
  isBookmark = false,
  showSummaryButton = true,
  showAddBookmarkButton = true,
  fetchingSummary
}) => {
  return (
    <Card sx={{ width: '100%',
      backgroundColor: isBookmark ? '#e3f2fd' : 'background.paper',
      '&:hover': {
        backgroundColor: isBookmark ? '#e3f2fd' : 'background.paper',
      }
     }}>
      <CardContent>
        <Typography variant="h6">{company.name}</Typography>
        <Typography color="textSecondary">{company.industry}</Typography>
        <Typography variant="body2">
          {company.website ? 
            <a
              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {company.website}
            </a> 
            : ''
          }
          
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onExpand(company.id);
            }}
            aria-expanded={expanded}
            aria-label="show more"
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
          {showAddBookmarkButton && (
            <Button
              size="small"
              onClick={() => onSaveBookmark(company.id, isBookmark)}
            >
              { !isBookmark ? 'Bookmark' : 'UnBookmark'}
            </Button>
          )}
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box>
              <Typography variant="body2"><strong>Size: </strong> {company.size || "NA"}</Typography>
              <Typography variant="body2"><strong>Founded: </strong> {company.founded || "NA"}</Typography>
              <Typography variant="body2"><strong>Location: </strong> 
                {company.location ? company.location.city + ", " + company.location.country : "NA"}
              </Typography>
              <Typography variant="body2"><strong>Linkedin: </strong>
                {company.linkedin_url ? 
                  <a
                    href={company.linkedin_url.startsWith('http') ? company.linkedin_url : `https://${company.linkedin_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {company.linkedin_url}
                  </a> 
                  : ''
                }
              </Typography>

              <Typography variant="body2">
                  <strong>Summary:</strong> {company.summary || "NA"}
              </Typography>
            </Box>

            {showSummaryButton && (
              <Box sx={{ mt: 2, alignSelf: 'flex-end' }}>
                <Button
                  size="small"
                  onClick={() => onGetSummary(company.id)}
                  disabled={fetchingSummary}
                >
                  {fetchingSummary ? (
                    <CircularProgress size={20} />
                  ) : (
                    'Get Summary'
                  )}
                </Button>
              </Box>
            )}
          </Box>
        </Collapse>

      </CardContent>
    </Card>
  );
};

export default CompanyCard;
