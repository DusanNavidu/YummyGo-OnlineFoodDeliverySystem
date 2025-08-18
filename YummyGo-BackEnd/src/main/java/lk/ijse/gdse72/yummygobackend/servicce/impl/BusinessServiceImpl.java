package lk.ijse.gdse72.yummygobackend.servicce.impl;

import lk.ijse.gdse72.yummygobackend.dto.BusinessDTO;
import lk.ijse.gdse72.yummygobackend.entity.Business;
import lk.ijse.gdse72.yummygobackend.entity.Role;
import lk.ijse.gdse72.yummygobackend.entity.User;
import lk.ijse.gdse72.yummygobackend.repository.BusinessRepository;
import lk.ijse.gdse72.yummygobackend.repository.UserRepository;
import lk.ijse.gdse72.yummygobackend.servicce.BusinessService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BusinessServiceImpl implements BusinessService {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    public void SaveBusiness(BusinessDTO businessDTO) {

        User user = userRepository.findById(businessDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // role check
        if (user.getRole() != Role.BUSINESS) {
            throw new RuntimeException("Only users with BUSINESS role can create businesses");
        }

        if (businessDTO.getBusinessStatus() == null) businessDTO.setBusinessStatus("Active");

        Business business = modelMapper.map(businessDTO, Business.class);
        business.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        business.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        businessRepository.save(business);
    }

    @Override
    public List<Business> getAllBusinessesEntity() {
        return businessRepository.findAll();
    }

}
