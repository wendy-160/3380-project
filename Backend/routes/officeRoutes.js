// routes/office.js
import { 
    getAllOffices, 
    getOfficesByState, 
    getOfficeById, 
    updateOffice, 
    createOffice, 
    deleteOffice 
} from '../controllers/officeController.js';

export async function handleOfficeRoutes(req, res){
    const url = req.url;
    const method = req.method;
    
    if (url === '/api/offices' && method === 'GET') {
        return await getAllOffices(req, res);
    }
    
    if (url === '/api/offices' && method === 'POST') {
        return await createOffice(req, res);
    }
    
    const stateMatch = url.match(/^\/api\/offices\/state\/(.+)$/);
    if (stateMatch && method === 'GET') {
        req.params = { state: stateMatch[1] };
        return await getOfficesByState(req, res);
    }
    
    const getIdMatch = url.match(/^\/api\/offices\/(\d+)$/);
    if (getIdMatch && method === 'GET') {
        req.params = { id: getIdMatch[1] };
        return await getOfficeById(req, res);
    }
    
    const putIdMatch = url.match(/^\/api\/offices\/(\d+)$/);
    if (putIdMatch && method === 'PUT') {
        req.params = { id: putIdMatch[1] };
        return await updateOffice(req, res);
    }
    
    const deleteIdMatch = url.match(/^\/api\/offices\/(\d+)$/);
    if (deleteIdMatch && method === 'DELETE') {
        req.params = { id: deleteIdMatch[1] };
        return await deleteOffice(req, res);
    }
    
    return false;
};