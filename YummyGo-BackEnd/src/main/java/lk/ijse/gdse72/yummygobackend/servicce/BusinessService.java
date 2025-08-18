package lk.ijse.gdse72.yummygobackend.servicce;

import lk.ijse.gdse72.yummygobackend.dto.BusinessDTO;
import lk.ijse.gdse72.yummygobackend.entity.Business;

import java.util.List;

public interface BusinessService {
    void SaveBusiness(BusinessDTO businessDTO);
    List<Business> getAllBusinessesEntity();

}
