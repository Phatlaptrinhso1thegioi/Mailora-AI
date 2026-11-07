/**
 * Mailora.ai — Prompt Manager & Benchmark Presets
 */

export const BENCHMARK_PRESETS = [
  {
    code: '01',
    brand: 'LUMIÈRE',
    expectedStyle: 'Luxury Beauty',
    prompt: 'Thương hiệu mỹ phẩm cao cấp LUMIÈRE ra mắt tinh chất phục hồi da ban đêm "Midnight Cellular Elixir" dành cho phụ nữ 25-45 tuổi. Định vị sang trọng, tinh tế, khoa học tế bào. Không giảm giá, tập trung tôn vinh làn da căng mịn nguyên bản và mời khám phá bộ sưu tập mới.'
  },
  {
    code: '02',
    brand: 'PHÁT Technology',
    expectedStyle: 'Modern Tech',
    prompt: 'Thương hiệu công nghệ PHÁT Technology giới thiệu thế hệ laptop siêu mỏng nhẹ "PHÁT AeroBook Pro X1" trang bị chip xử lý AI Neural Engine, màn hình OLED 120Hz chuẩn màu đồ họa, pin 20 giờ cho kỹ sư phần mềm và nhà sáng tạo nội dung. Mời đăng ký trải nghiệm sớm và đặt trước.'
  },
  {
    code: '03',
    brand: 'MONO Studio',
    expectedStyle: 'Fashion Editorial',
    prompt: 'Thương hiệu thời trang thiết kế tối giản MONO Studio ra mắt Lookbook Thu Đông "SILHOUETTE IN MOTION" với các thiết kế áo khoác trench coat và suit tailoring phom dáng kiến trúc, chất liệu len cashmere thượng hạng. Phong cách Fashion Editorial đen trắng sắc sảo.'
  },
  {
    code: '04',
    brand: 'BREW & CO.',
    expectedStyle: 'Organic Lifestyle',
    prompt: 'Xưởng cà phê thủ công BREW & CO. giới thiệu dòng cà phê hạt Arabica Cầu Đất sơ chế Natural ủ men tự nhiên, rang mẻ nhỏ mỗi tuần, hương hoa quả chín và hậu vị mật ong rừng ấm áp. Dành cho người yêu cà phê nguyên bản buổi sáng.'
  },
  {
    code: '05',
    brand: 'NOMAD Travel',
    expectedStyle: 'Travel Experience',
    prompt: 'Thương hiệu nghỉ dưỡng NOMAD Travel giới thiệu hành trình "Private Cliffside Sanctuary" 4 ngày 3 đêm tại vịnh biển nguyên sơ, biệt thự hướng biển riêng tư, ẩm thực địa phương tinh tuyển và thiền định lúc bình minh. Không gian khoáng đạt, giàu trải nghiệm.'
  },
  {
    code: '06',
    brand: 'NexusFlow (SaaS Startup)',
    expectedStyle: 'Modern Digital',
    prompt: 'Nền tảng phần mềm SaaS Startup "NexusFlow" ra mắt tính năng Tự động hóa quy trình làm việc bằng AI Agent 2.0 giúp các đội ngũ Product & Marketing tiết kiệm 65% thời gian tổng hợp báo cáo tuần. Tích hợp 1-click với Slack, Notion và Jira. Mời dùng thử miễn phí 14 ngày.'
  }
];

export function getBenchmarkPreset(index) {
  return BENCHMARK_PRESETS[index % BENCHMARK_PRESETS.length];
}
