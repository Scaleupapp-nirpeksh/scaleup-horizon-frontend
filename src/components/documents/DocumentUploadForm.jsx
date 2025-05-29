// src/components/documents/DocumentUploadForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Grid, Typography, Box, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Chip, Autocomplete
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AlertMessage from '../common/AlertMessage';
import { uploadDocumentFile, getRounds, getInvestors } from '../../services/api'; // Assuming getRounds and getInvestors

// Updated to match backend enum exactly
const documentCategories = [
  'Investor Agreement', 
  'Shareholder Agreement', 
  'Financial Report', 
  'Pitch Deck', 
  'Board Minutes',
  'Legal Document', 
  'Compliance Document', 
  'Invoice', 
  'Receipt', 
  'Contract', 
  'Employee Document', 
  'Other'
];

const DocumentUploadForm = ({ onDocumentUploaded, onCancel }) => {
  const [file, setFile] = useState(null);
  const [fileNameDisplay, setFileNameDisplay] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other'); // Default to 'Other' which is safe
  const [tags, setTags] = useState([]);
  const [associatedRoundId, setAssociatedRoundId] = useState('');
  const [associatedInvestorId, setAssociatedInvestorId] = useState('');
  
  const [rounds, setRounds] = useState([]);
  const [investors, setInvestors] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roundsRes, investorsRes] = await Promise.all([
          getRounds(),
          getInvestors() // Fetch all investors for simplicity
        ]);
        setRounds(roundsRes.data || []);
        setInvestors(investorsRes.data || []);
      } catch (error) {
        console.error("Error fetching rounds/investors for document form:", error);
        setMessage({type: 'error', text: 'Could not load association options.'});
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileNameDisplay(selectedFile.name);
    }
  };

  const handleTagsChange = (event, newValue) => {
    setTags(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('documentFile', file); // 'documentFile' must match multer field name in backend
    formData.append('description', description);
    formData.append('category', category);
    if (tags.length > 0) formData.append('tags', tags.join(','));
    if (associatedRoundId) formData.append('associatedRoundId', associatedRoundId);
    if (associatedInvestorId) formData.append('associatedInvestorId', associatedInvestorId);

    try {
      const response = await uploadDocumentFile(formData);
      setMessage({ type: 'success', text: 'Document uploaded successfully!' });
      if (onDocumentUploaded) onDocumentUploaded(response.data);
      // Reset form
      setFile(null);
      setFileNameDisplay('');
      setDescription('');
      setCategory('Other'); // Reset to default
      setTags([]);
      setAssociatedRoundId('');
      setAssociatedInvestorId('');
      if(onCancel) setTimeout(onCancel, 1500); // Close dialog after success
    } catch (error) {
      console.error("Error uploading document:", error);
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to upload document.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Upload New Document
      </Typography>
      <AlertMessage message={message.text} severity={message.type || 'info'} />
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<UploadFileIcon />}
            >
              {fileNameDisplay || 'Select Document File'}
              <input type="file" hidden onChange={handleFileChange} required />
            </Button>
          </Grid>
          <Grid item xs={12}>
            <TextField 
              name="description" 
              label="Description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              fullWidth 
              required 
              multiline 
              rows={2}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select 
                name="category" 
                value={category} 
                label="Category" 
                onChange={(e) => setCategory(e.target.value)}
              >
                {documentCategories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              multiple
              id="tags-filled"
              options={[]} // Provide some common tags or leave empty for freeform
              value={tags}
              onChange={handleTagsChange}
              freeSolo
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Tags (Optional)"
                  placeholder="Type and press Enter"
                />
              )}
            />
          </Grid>
           <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Associate with Round (Optional)</InputLabel>
              <Select 
                value={associatedRoundId} 
                label="Associate with Round (Optional)" 
                onChange={(e) => setAssociatedRoundId(e.target.value)}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {rounds.map(round => (
                  <MenuItem key={round._id} value={round._id}>{round.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
             <FormControl fullWidth>
              <InputLabel>Associate with Investor (Optional)</InputLabel>
              <Select 
                value={associatedInvestorId} 
                label="Associate with Investor (Optional)" 
                onChange={(e) => setAssociatedInvestorId(e.target.value)}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {investors.map(inv => (
                  <MenuItem key={inv._id} value={inv._id}>{inv.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            {onCancel && (
              <Button variant="text" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={isLoading || !file} 
              startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <UploadFileIcon />}
            >
              {isLoading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DocumentUploadForm;