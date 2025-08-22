package lk.ijse.gdse72.yummygobackend.servicce.impl;

import lk.ijse.gdse72.yummygobackend.dto.BusinessDTO;
import lk.ijse.gdse72.yummygobackend.entity.Business;
import lk.ijse.gdse72.yummygobackend.entity.User;
import lk.ijse.gdse72.yummygobackend.repository.BusinessRepository;
import lk.ijse.gdse72.yummygobackend.repository.UserRepository;
import lk.ijse.gdse72.yummygobackend.servicce.BusinessService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BusinessServiceImpl implements BusinessService {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    public void SaveBusiness(BusinessDTO businessDTO) {
        if (businessDTO.getBusinessStatus() == null)
            businessDTO.setBusinessStatus("Active");

        Business business = modelMapper.map(businessDTO, Business.class);
        business.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        business.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        if (businessDTO.getUserId() != null) {
            User user = userRepository.findById(businessDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + businessDTO.getUserId()));
            business.setUser(user);
        } else {
            throw new RuntimeException("User ID is required to create a business");
        }

        businessRepository.save(business);
    }

    @Override
    public List<Business> getAllBusinessesEntity() {
        return businessRepository.findAll();
    }

    @Override
    public List<Business> getBusinessesByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        return businessRepository.findByUser(user); // <-- use repository method
    }
}
