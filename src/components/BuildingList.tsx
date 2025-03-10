import React, { useState } from 'react';
import { 
  List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Chip, Typography, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button, Paper, Alert, Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Building } from '../types';
import { styled } from '@mui/material/styles';
import { ENDPOINTS } from '../config';

// Componentes estilizados
const EmptyStateBox = styled('div')({
  padding: 16,
  textAlign: 'center'
});

const ChipsContainer = styled('div')({
  marginTop: 8,
  display: 'flex',
  gap: 8
});

const StyledChip = styled(Chip)({
  marginRight: 8
});

const ViewButton = styled(IconButton)({
  marginRight: 8
});

interface BuildingListProps {
  buildings: Building[];
  onBuildingSelect: (id: string) => void;
  onBuildingDelete: (id: string) => void;
}

export const BuildingList: React.FC<BuildingListProps> = ({ 
  buildings, 
  onBuildingSelect,
  onBuildingDelete 
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (buildingId: string) => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`${ENDPOINTS.buildings}/${buildingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete building');
      }

      // Esperar un momento antes de actualizar la UI
      await new Promise(resolve => setTimeout(resolve, 500));
      onBuildingDelete(buildingId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting building:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete building');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Buildings</Typography>
        <List>
          {buildings.length === 0 ? (
            <EmptyStateBox>
              <Typography color="text.secondary">
                No buildings added yet
              </Typography>
            </EmptyStateBox>
          ) : (
            buildings.map((building) => (
              <ListItem key={building.id}>
                <ListItemText
                  primary={building.name}
                  secondary={`Type: ${building.type} | Floors: ${building.floors.length} | Devices: ${building.devices_count}`}
                />
                <ListItemSecondaryAction>
                  <ViewButton 
                    edge="end" 
                    onClick={() => onBuildingSelect(building.id)}
                  >
                    <VisibilityIcon />
                  </ViewButton>
                  <IconButton 
                    edge="end" 
                    onClick={() => setDeleteConfirm(building.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>

        <Dialog
          open={!!deleteConfirm}
          onClose={() => !isDeleting && setDeleteConfirm(null)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this building?
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteConfirm(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)} 
              color="error"
              variant="contained"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}; 