// src/components/documents/DocumentList.jsx
import React from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar,alpha,
  IconButton, Tooltip, Divider, Chip, Link as MuiLink, Grid
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description'; // Generic doc
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import TableChartIcon from '@mui/icons-material/TableChart'; // For spreadsheets
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingSpinner from '../common/LoadingSpinner';
import { downloadDocumentLink, deleteDocument as deleteDocApi } from '../../services/api'; // Renamed deleteDocument for clarity

const getFileIcon = (fileType) => {
  if (fileType.includes('pdf')) return <PictureAsPdfIcon />;
  if (fileType.includes('image')) return <ImageIcon />;
  if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('csv')) return <TableChartIcon />;
  return <DescriptionIcon />;
};

const DocumentList = ({ documents, loading, onDeleteDocument }) => {

  const handleDownload = async (docId, fileName) => {
    try {
        const response = await downloadDocumentLink(docId);
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.setAttribute('download', fileName || 'download'); // Or use a default filename
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error("Error getting download link:", error);
        alert("Could not get download link.");
    }
  };


  if (loading) return <LoadingSpinner message="Loading documents..." />;
  if (!documents || documents.length === 0) {
    return (
      <Paper elevation={0} sx={{ textAlign: 'center', py: 4, borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05) }}>
        <FolderIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography color="text.secondary">No documents uploaded yet.</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{borderRadius: '16px', overflow:'hidden'}}>
        <List sx={{p:0}}>
        {documents.map((doc, index) => (
            <React.Fragment key={doc._id}>
            <ListItem
                secondaryAction={
                <>
                    <Tooltip title="Download Document">
                    <IconButton edge="end" onClick={() => handleDownload(doc._id, doc.fileName)}>
                        <DownloadIcon />
                    </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Document">
                    <IconButton edge="end" sx={{ml:1}} onClick={() => onDeleteDocument(doc._id, doc.fileName)}>
                        <DeleteIcon color="error" />
                    </IconButton>
                    </Tooltip>
                </>
                }
                sx={{py: 1.5}}
            >
                <ListItemAvatar>
                <Avatar sx={{bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1)}}>
                    {getFileIcon(doc.fileType)}
                </Avatar>
                </ListItemAvatar>
                <ListItemText
                primary={<Typography variant="subtitle1" sx={{fontWeight: 500}} noWrap>{doc.fileName}</Typography>}
                secondary={
                    <>
                    <Typography component="span" variant="body2" color="text.secondary">
                        Category: {doc.category} | Size: {doc.fileSize ? (doc.fileSize / 1024).toFixed(1) : 'N/A'} KB
                    </Typography>
                    <br/>
                    <Typography component="span" variant="caption" color="text.secondary">
                        Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                        {doc.associatedRoundId?.name && ` | Round: ${doc.associatedRoundId.name}`}
                        {doc.associatedInvestorId?.name && ` | Investor: ${doc.associatedInvestorId.name}`}
                    </Typography>
                    {doc.tags && doc.tags.length > 0 && (
                        <Box sx={{mt:0.5}}>
                            {doc.tags.map(tag => <Chip key={tag} label={tag} size="small" sx={{mr:0.5, fontSize: '0.7rem'}}/>)}
                        </Box>
                    )}
                    </>
                }
                />
            </ListItem>
            {index < documents.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
        ))}
        </List>
    </Paper>
  );
};

export default DocumentList;
