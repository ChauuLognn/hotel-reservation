package modules.hotelservice.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import modules.hotelservice.dto.ServiceCreationRequest;
import modules.hotelservice.repository.ServiceRepository;

@Service
public class ServiceService {
    @Autowired ServiceRepository serRepo;

    @Transactional
    public modules.hotelservice.entity.Service create(ServiceCreationRequest rq){
        serRepo.insertService(rq.getName(), rq.getPrice());
        modules.hotelservice.entity.Service s = serRepo.findByName(rq.getName()).
            orElseThrow(() -> new IllegalArgumentException("Service not found"));
        return s;
    }

    public modules.hotelservice.entity.Service getByName(String name){
        return serRepo.findByName(name).
            orElseThrow(() -> new IllegalArgumentException("Service not found"));
    }

    public List<modules.hotelservice.entity.Service> getAllService(){
        return serRepo.takeAll();
    }

    @Transactional
    public modules.hotelservice.entity.Service update(String name, ServiceCreationRequest rq){
        serRepo.findByName(name).
            orElseThrow(() -> new IllegalArgumentException("Service not found"));
        serRepo.updateService(name, rq.getPrice(), rq.getStatus());
        return serRepo.findByName(name)
            .orElseThrow(() -> new IllegalStateException("Cannot load service after update"));
    }

    @Transactional
    public void delete(String name){
        serRepo.deleteSer(name);
    }
}
