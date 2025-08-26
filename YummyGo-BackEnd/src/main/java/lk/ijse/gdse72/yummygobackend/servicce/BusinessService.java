package lk.ijse.gdse72.yummygobackend.servicce;

import lk.ijse.gdse72.yummygobackend.dto.BusinessDTO;
import lk.ijse.gdse72.yummygobackend.entity.Business;

import java.util.List;
import java.util.Optional;

public interface BusinessService {


    void SaveBusiness(BusinessDTO businessDTO);
    List<Business> getAllBusinessesEntity();
    List<Business> getBusinessesByUserId(Long userId);
    List<Business> getBusinessesByLocation(String location);
    List<Business> getBusinessesByKeyword(String keyword, String location);
    Optional<Business> getBusinessProfile(Long businessId);
}