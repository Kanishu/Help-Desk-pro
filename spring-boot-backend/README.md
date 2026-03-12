# HelpDesk Pro - Spring Boot Backend Specification

This document provides comprehensive specifications for implementing the backend of the Multi-Tenant SaaS Helpdesk System using Spring Boot with Spring Security.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Security Configuration](#security-configuration)
6. [Multi-Tenancy Implementation](#multi-tenancy-implementation)
7. [Email Service](#email-service)
8. [Testing Strategy](#testing-strategy)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (React/Next.js)                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API Gateway / Load Balancer                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Spring Boot Application                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Security   │  │ Controllers │  │  Services   │  │Repositories │ │
│  │   Filter    │  │   (REST)    │  │  (Business) │  │   (JPA)     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │  Tenant     │  │   Email     │  │  WebSocket  │                  │
│  │  Context    │  │   Service   │  │   Handler   │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
            │ PostgreSQL  │ │    Redis    │ │   RabbitMQ  │
            │   (RLS)     │ │   (Cache)   │ │   (Queue)   │
            └─────────────┘ └─────────────┘ └─────────────┘
```

---

## Project Structure

```
helpdesk-backend/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/helpdesk/
│       │       ├── HelpDeskApplication.java
│       │       ├── config/
│       │       │   ├── SecurityConfig.java
│       │       │   ├── TenantConfig.java
│       │       │   ├── WebSocketConfig.java
│       │       │   ├── MailConfig.java
│       │       │   └── CacheConfig.java
│       │       ├── security/
│       │       │   ├── JwtAuthenticationFilter.java
│       │       │   ├── JwtTokenProvider.java
│       │       │   ├── TenantFilter.java
│       │       │   └── CustomUserDetails.java
│       │       ├── tenant/
│       │       │   ├── TenantContext.java
│       │       │   ├── TenantInterceptor.java
│       │       │   └── TenantAwareRepository.java
│       │       ├── controller/
│       │       │   ├── AuthController.java
│       │       │   ├── TicketController.java
│       │       │   ├── CustomerController.java
│       │       │   ├── AgentController.java
│       │       │   ├── AnalyticsController.java
│       │       │   └── WebhookController.java
│       │       ├── service/
│       │       │   ├── AuthService.java
│       │       │   ├── TicketService.java
│       │       │   ├── CustomerService.java
│       │       │   ├── EmailService.java
│       │       │   ├── NotificationService.java
│       │       │   └── AnalyticsService.java
│       │       ├── repository/
│       │       │   ├── OrganizationRepository.java
│       │       │   ├── UserRepository.java
│       │       │   ├── TicketRepository.java
│       │       │   ├── CustomerRepository.java
│       │       │   └── CommentRepository.java
│       │       ├── entity/
│       │       │   ├── Organization.java
│       │       │   ├── User.java
│       │       │   ├── Ticket.java
│       │       │   ├── Customer.java
│       │       │   ├── Comment.java
│       │       │   └── EmailQueue.java
│       │       ├── dto/
│       │       │   ├── request/
│       │       │   │   ├── CreateTicketRequest.java
│       │       │   │   ├── LoginRequest.java
│       │       │   │   └── UpdateTicketRequest.java
│       │       │   └── response/
│       │       │       ├── TicketResponse.java
│       │       │       ├── DashboardStatsResponse.java
│       │       │       └── AuthResponse.java
│       │       └── exception/
│       │           ├── GlobalExceptionHandler.java
│       │           ├── UnauthorizedException.java
│       │           └── TicketNotFoundException.java
│       └── resources/
│           ├── application.yml
│           ├── application-dev.yml
│           ├── application-prod.yml
│           └── db/migration/
│               ├── V1__initial_schema.sql
│               ├── V2__row_level_security.sql
│               └── V3__seed_data.sql
├── pom.xml
├── Dockerfile
└── docker-compose.yml
```

---

## Key Implementation Files

### 1. Security Configuration

```java
// SecurityConfig.java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtFilter;
    
    @Autowired
    private TenantFilter tenantFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/public/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(tenantFilter, JwtAuthenticationFilter.class)
            .build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

### 2. Multi-Tenant Context

```java
// TenantContext.java
public class TenantContext {
    private static final ThreadLocal<UUID> currentTenant = new ThreadLocal<>();
    
    public static UUID getCurrentTenant() {
        return currentTenant.get();
    }
    
    public static void setCurrentTenant(UUID tenantId) {
        currentTenant.set(tenantId);
    }
    
    public static void clear() {
        currentTenant.remove();
    }
}

// TenantFilter.java
@Component
public class TenantFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
                TenantContext.setCurrentTenant(user.getOrganizationId());
            }
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
```

### 3. Tenant-Aware Repository

```java
// TenantAwareRepository.java
public interface TenantAwareRepository<T, ID> extends JpaRepository<T, ID> {
    
    @Query("SELECT e FROM #{#entityName} e WHERE e.organizationId = :orgId")
    List<T> findAllByOrganization(@Param("orgId") UUID organizationId);
}

// TicketRepository.java
@Repository
public interface TicketRepository extends TenantAwareRepository<Ticket, UUID> {
    
    @Query("SELECT t FROM Ticket t WHERE t.organizationId = :orgId AND t.status = :status")
    List<Ticket> findByStatus(
        @Param("orgId") UUID organizationId, 
        @Param("status") TicketStatus status
    );
    
    @Query("SELECT t FROM Ticket t WHERE t.organizationId = :orgId AND t.assignedTo.id = :agentId")
    List<Ticket> findByAssignedAgent(
        @Param("orgId") UUID organizationId, 
        @Param("agentId") UUID agentId
    );
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.organizationId = :orgId AND t.status = 'OPEN'")
    long countOpenTickets(@Param("orgId") UUID organizationId);
}
```

### 4. Ticket Entity

```java
// Ticket.java
@Entity
@Table(name = "tickets")
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "orgId", type = UUID.class))
@Filter(name = "tenantFilter", condition = "organization_id = :orgId")
public class Ticket {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;
    
    @Column(name = "ticket_number")
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long ticketNumber;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    private TicketStatus status = TicketStatus.OPEN;
    
    @Enumerated(EnumType.STRING)
    private TicketPriority priority = TicketPriority.MEDIUM;
    
    private String category;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> tags = new ArrayList<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;
    
    @Column(name = "first_response_at")
    private Instant firstResponseAt;
    
    @Column(name = "resolved_at")
    private Instant resolvedAt;
    
    @Column(name = "due_date")
    private Instant dueDate;
    
    @Column(name = "sla_breach")
    private boolean slaBreach = false;
    
    @CreatedDate
    @Column(name = "created_at")
    private Instant createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    @PrePersist
    public void prePersist() {
        if (organizationId == null) {
            organizationId = TenantContext.getCurrentTenant();
        }
    }
}
```

### 5. Email Service

```java
// EmailService.java
@Service
@Slf4j
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private TemplateEngine templateEngine;
    
    @Autowired
    private EmailQueueRepository emailQueueRepository;
    
    @Async
    public void sendTicketCreatedEmail(Ticket ticket, Customer customer) {
        EmailQueue email = EmailQueue.builder()
            .organizationId(ticket.getOrganizationId())
            .ticketId(ticket.getId())
            .toEmail(customer.getEmail())
            .subject("Ticket #" + ticket.getTicketNumber() + " - " + ticket.getSubject())
            .template("ticket-created")
            .status(EmailStatus.PENDING)
            .build();
        
        emailQueueRepository.save(email);
        processEmail(email);
    }
    
    @Scheduled(fixedRate = 60000) // Every minute
    public void processEmailQueue() {
        List<EmailQueue> pending = emailQueueRepository
            .findByStatusAndAttemptsLessThan(EmailStatus.PENDING, 3);
        
        for (EmailQueue email : pending) {
            processEmail(email);
        }
    }
    
    private void processEmail(EmailQueue email) {
        try {
            Context context = new Context();
            context.setVariable("ticket", email.getTicket());
            
            String htmlContent = templateEngine.process(email.getTemplate(), context);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(email.getToEmail());
            helper.setSubject(email.getSubject());
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            
            email.setStatus(EmailStatus.SENT);
            email.setSentAt(Instant.now());
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage());
            email.setAttempts(email.getAttempts() + 1);
            email.setErrorMessage(e.getMessage());
            email.setLastAttemptAt(Instant.now());
        }
        
        emailQueueRepository.save(email);
    }
}
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new organization |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/refresh` | Refresh JWT token |
| POST | `/api/v1/auth/logout` | Logout user |

### Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tickets` | List all tickets (with pagination) |
| GET | `/api/v1/tickets/{id}` | Get ticket details |
| POST | `/api/v1/tickets` | Create new ticket |
| PUT | `/api/v1/tickets/{id}` | Update ticket |
| DELETE | `/api/v1/tickets/{id}` | Delete ticket (admin only) |
| POST | `/api/v1/tickets/{id}/comments` | Add comment to ticket |
| PUT | `/api/v1/tickets/{id}/assign` | Assign ticket to agent |
| PUT | `/api/v1/tickets/{id}/status` | Update ticket status |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/customers` | List all customers |
| GET | `/api/v1/customers/{id}` | Get customer details |
| POST | `/api/v1/customers` | Create new customer |
| PUT | `/api/v1/customers/{id}` | Update customer |
| GET | `/api/v1/customers/{id}/tickets` | Get customer's tickets |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/dashboard` | Dashboard statistics |
| GET | `/api/v1/analytics/tickets/trend` | Ticket volume trend |
| GET | `/api/v1/analytics/agents/performance` | Agent performance metrics |
| GET | `/api/v1/analytics/sla/compliance` | SLA compliance report |

---

## Application Configuration

```yaml
# application.yml
spring:
  application:
    name: helpdesk-backend
  
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:helpdesk}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
  
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        default_schema: public
        format_sql: true
  
  flyway:
    enabled: true
    locations: classpath:db/migration
  
  mail:
    host: ${MAIL_HOST:smtp.gmail.com}
    port: ${MAIL_PORT:587}
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000 # 24 hours
  refresh-expiration: 604800000 # 7 days

server:
  port: 8080

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
```

---

## Testing Strategy

### Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class TicketServiceTest {
    
    @Mock
    private TicketRepository ticketRepository;
    
    @Mock
    private EmailService emailService;
    
    @InjectMocks
    private TicketService ticketService;
    
    @BeforeEach
    void setUp() {
        TenantContext.setCurrentTenant(UUID.randomUUID());
    }
    
    @Test
    void createTicket_ShouldCreateAndSendEmail() {
        // Given
        CreateTicketRequest request = new CreateTicketRequest();
        request.setSubject("Test Ticket");
        request.setDescription("Test Description");
        request.setPriority(TicketPriority.HIGH);
        
        // When
        Ticket result = ticketService.createTicket(request);
        
        // Then
        assertNotNull(result.getId());
        assertEquals("Test Ticket", result.getSubject());
        verify(emailService, times(1)).sendTicketCreatedEmail(any(), any());
    }
}
```

### Integration Tests
```java
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class TicketControllerIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Test
    @WithMockUser(roles = "AGENT")
    void getTickets_ShouldReturnOnlyTenantTickets() throws Exception {
        mockMvc.perform(get("/api/v1/tickets")
                .header("X-Tenant-ID", "tenant-1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content[*].organizationId")
                .value(everyItem(equalTo("tenant-1"))));
    }
}
```

---

## Running the Backend

1. **Development Mode:**
   ```bash
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
   ```

2. **Production Build:**
   ```bash
   ./mvnw clean package -DskipTests
   java -jar target/helpdesk-backend-1.0.0.jar
   ```

3. **With Docker:**
   ```bash
   docker-compose up -d
   ```

---

This specification provides a complete blueprint for implementing the Spring Boot backend. The frontend is already built and ready to integrate via the REST API endpoints defined above.
