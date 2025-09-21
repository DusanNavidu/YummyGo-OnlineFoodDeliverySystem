package lk.ijse.gdse72.yummygobackend.service.impl;

import lk.ijse.gdse72.yummygobackend.dto.BusinessDTO;
import lk.ijse.gdse72.yummygobackend.entity.Business;
import lk.ijse.gdse72.yummygobackend.entity.User;
import lk.ijse.gdse72.yummygobackend.repository.BusinessRepository;
import lk.ijse.gdse72.yummygobackend.repository.UserRepository;
import lk.ijse.gdse72.yummygobackend.service.BusinessService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

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
    public List<Business> getBusinessesByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        return businessRepository.findByUser(user); // <-- use repository method
    }

    @Override
    public List<Business> getBusinessesByLocation(String location) {
        return businessRepository.findByBusinessAddress(location);
    }

    @Override
    public List<Business> getBusinessesByKeyword(String keyword, String location) {
        return businessRepository.searchBusinesses(keyword, location);
    }

    @Override
    public Optional<Business> getBusinessProfile(Long businessId) {
        return businessRepository.findByBusinessId(businessId);
    }

    @Override
    public Page<BusinessDTO> getAllBusinesses(int page, int size) {
        Page<Business> businesses = businessRepository.findAll(PageRequest.of(page, size));

        return businesses.map(b -> {
            BusinessDTO dto = new BusinessDTO();
            dto.setBusinessId(b.getBusinessId());
            dto.setBusinessName(b.getBusinessName());
            dto.setContactNumber1(b.getContactNumber1());
            dto.setContactNumber2(b.getContactNumber2());
            dto.setBusinessEmail(b.getBusinessEmail());
            dto.setBusinessAddress(b.getBusinessAddress());
            dto.setBusinessAreaPostalCode(b.getBusinessAreaPostalCode());
            dto.setBusinessCategory(b.getBusinessCategory());
            dto.setBusinessLogo(b.getBusinessLogo());
            dto.setOpenTime(b.getOpenTime());
            dto.setCloseTime(b.getCloseTime());
            dto.setOpenOrClose(b.getOpenOrClose());
            dto.setBusinessDescription(b.getBusinessDescription());
            dto.setLatitude(b.getLatitude());
            dto.setLongitude(b.getLongitude());
            dto.setBusinessStatus(b.getBusinessStatus());
            dto.setUserId(b.getUser() != null ? b.getUser().getId() : null);
            dto.setCreatedAt(b.getCreatedAt());
            dto.setUpdatedAt(b.getUpdatedAt());
            return dto;
        });
    }
}
