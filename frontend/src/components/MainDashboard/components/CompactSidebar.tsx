import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Filter,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Zap
} from 'lucide-react';

// Shared components
import SearchFilter from '../../shared/SearchFilter';

// Types
import { ToolCategories } from '../../shared/types';

interface CompactSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  selectedSubCategory: string | null;
  onSubCategoryChange: (subCategory: string | null) => void;
  toolCategories: ToolCategories;
  onCategoryClick: (categoryName: string | null, categoryData?: any) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  theme: any;
}

// Session control for animation
const SIDEBAR_ANIMATION_KEY = 'sidebar_animation_shown';
const ANIMATION_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const shouldShowAnimation = (): boolean => {
  const lastShown = localStorage.getItem(SIDEBAR_ANIMATION_KEY);
  if (!lastShown) return true;
  
  const lastShownTime = parseInt(lastShown, 10);
  const now = Date.now();
  return (now - lastShownTime) > ANIMATION_COOLDOWN;
};

const markAnimationShown = (): void => {
  localStorage.setItem(SIDEBAR_ANIMATION_KEY, Date.now().toString());
};

const CompactSidebar: React.FC<CompactSidebarProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  selectedCategory,
  onCategoryChange,
  selectedSubCategory,
  onSubCategoryChange,
  toolCategories,
  onCategoryClick,
  collapsed,
  onToggleCollapse,
  theme
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [rippleIndex, setRippleIndex] = useState(-1);
  const [shouldAutoExpand, setShouldAutoExpand] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  // Calculate total tools count
  const totalTools = Object.values(toolCategories).reduce((sum, category) => {
    if ('tools' in category) {
      return sum + category.tools.length;
    } else if ('subCategories' in category) {
      return sum + Object.values(category.subCategories).reduce((subSum, subCat) => subSum + subCat.tools.length, 0);
    }
    return sum;
  }, 0);

  // Ripple effect for chips
  const startRippleEffect = useCallback(() => {
    const categoryEntries = Object.entries(toolCategories).slice(0, 5);
    categoryEntries.forEach((_, index) => {
      setTimeout(() => {
        setRippleIndex(index);
        // Reset ripple after animation
        setTimeout(() => setRippleIndex(-1), 1000);
      }, index * 200); // 200ms delay between each chip
    });
  }, [toolCategories]);

  // Check if we should show the animation on mount (only once)
  useEffect(() => {
    if (shouldShowAnimation() && collapsed && !userHasInteracted) {
      setShouldAutoExpand(true);
      setIsAnimating(true);
      markAnimationShown();
    }
  }, []); // Empty dependency array - only run once on mount

  // Handle auto-expand animation
  useEffect(() => {
    if (shouldAutoExpand && collapsed && !userHasInteracted) {
      // Auto-expand after a short delay
      const expandTimer = setTimeout(() => {
        onToggleCollapse(); // Expand the sidebar
      }, 500);

      // Start ripple effect after sidebar is expanded
      const rippleTimer = setTimeout(() => {
        startRippleEffect();
      }, 1000);

      // Auto-collapse after 2 seconds
      const collapseTimer = setTimeout(() => {
        onToggleCollapse(); // Collapse the sidebar
        setIsAnimating(false);
        setShouldAutoExpand(false);
      }, 3000);

      return () => {
        clearTimeout(expandTimer);
        clearTimeout(rippleTimer);
        clearTimeout(collapseTimer);
      };
    }
  }, [shouldAutoExpand, collapsed, onToggleCollapse, startRippleEffect, userHasInteracted]);

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ 
        x: 0, 
        opacity: 1,
        ...(isAnimating && {
          scale: [1, 1.02, 1],
          boxShadow: [
            '0 8px 32px rgba(0,0,0,0.1)',
            '0 12px 40px rgba(74, 222, 128, 0.2)',
            '0 8px 32px rgba(0,0,0,0.1)'
          ]
        })
      }}
      transition={{ 
        duration: 0.3,
        ...(isAnimating && {
          scale: { duration: 2, ease: 'easeInOut' },
          boxShadow: { duration: 2, ease: 'easeInOut' }
        })
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          height: 'fit-content',
          minHeight: '400px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: collapsed ? 1 : 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            minHeight: 56,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
            }
          }}
        >
          {/* Animation indicator */}
          {isAnimating && !collapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #4ade80, #22c55e)',
                boxShadow: '0 0 10px rgba(74, 222, 128, 0.6)',
                zIndex: 10
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '2px solid transparent',
                  borderTop: '2px solid rgba(255,255,255,0.8)',
                }}
              />
            </motion.div>
          )}
          {!collapsed && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: 'linear-gradient(45deg, #4ade80, #22c55e)',
                boxShadow: '0 0 8px rgba(74, 222, 128, 0.4)'
              }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                Tools
              </Typography>
            </Box>
          )}
          <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <IconButton
              size="small"
              onClick={() => {
                setUserHasInteracted(true);
                onToggleCollapse();
              }}
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                '&:hover': { 
                  color: '#ffffff',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Content */}
        <Box sx={{ p: collapsed ? 1 : 2, height: 'calc(100% - 56px)', overflow: 'auto' }}>
          {!collapsed ? (
            <>
              {/* Search Section */}
              <Box sx={{ 
                mb: 2, 
                p: 2, 
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                }
              }}>
                <Typography variant="subtitle2" sx={{ 
                  mb: 1, 
                  color: 'rgba(255,255,255,0.9)', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Search size={16} color="rgba(255,255,255,0.7)" />
                  Search Tools
                </Typography>
                <SearchFilter
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
                  onClearSearch={onClearSearch}
                  selectedCategory={selectedCategory}
                  onCategoryChange={onCategoryChange}
                  selectedSubCategory={selectedSubCategory}
                  onSubCategoryChange={onSubCategoryChange}
                  toolCategories={toolCategories}
                  theme={theme}
                  onCategoryClick={onCategoryClick}
                  compact={true}
                />
              </Box>

              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

              {/* Quick Stats */}
              <Box sx={{ 
                mb: 2, 
                p: 2, 
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                }
              }}>
                <Typography variant="subtitle2" sx={{ 
                  mb: 1, 
                  color: 'rgba(255,255,255,0.9)', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Activity size={16} color="rgba(255,255,255,0.7)" />
                  Quick Stats
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Total Tools
                    </Typography>
                    <Chip 
                      label={totalTools} 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(74, 222, 128, 0.2)',
                        color: '#4ade80',
                        border: '1px solid rgba(74, 222, 128, 0.3)'
                      }} 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Categories
                    </Typography>
                    <Chip 
                      label={Object.keys(toolCategories).length} 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        color: '#3b82f6',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }} 
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

              {/* Category Quick Access */}
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                }
              }}>
                <Typography variant="subtitle2" sx={{ 
                  mb: 1, 
                  color: 'rgba(255,255,255,0.9)', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Zap size={16} color="rgba(255,255,255,0.7)" />
                  Quick Access
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(toolCategories).slice(0, 5).map(([categoryId, category], index) => {
                    const toolCount = 'tools' in category 
                      ? category.tools.length 
                      : Object.values(category.subCategories).reduce((sum, subCat) => sum + subCat.tools.length, 0);
                    
                    const isRippling = rippleIndex === index;
                    
                    return (
                      <Tooltip key={categoryId} title={`${categoryId} (${toolCount} tools)`}>
                        <motion.div
                          animate={isRippling ? {
                            scale: [1, 1.05, 1],
                            boxShadow: [
                              '0 0 0 rgba(74, 222, 128, 0)',
                              '0 0 20px rgba(74, 222, 128, 0.6)',
                              '0 0 0 rgba(74, 222, 128, 0)'
                            ]
                          } : {}}
                          transition={{ duration: 1, ease: 'easeInOut' }}
                        >
                          <Chip
                            label={`${categoryId} (${toolCount})`}
                            size="small"
                            onClick={() => {
                              setUserHasInteracted(true);
                              onCategoryClick(categoryId, category);
                            }}
                            sx={{
                              backgroundColor: selectedCategory === categoryId 
                                ? 'rgba(74, 222, 128, 0.2)' 
                                : isRippling 
                                  ? 'rgba(74, 222, 128, 0.15)'
                                  : 'rgba(255,255,255,0.05)',
                              color: selectedCategory === categoryId || isRippling ? '#4ade80' : '#ffffff',
                              border: selectedCategory === categoryId 
                                ? '1px solid rgba(74, 222, 128, 0.3)' 
                                : isRippling
                                  ? '1px solid rgba(74, 222, 128, 0.4)'
                                  : '1px solid rgba(255,255,255,0.1)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              position: 'relative',
                              overflow: 'hidden',
                              '&::before': isRippling ? {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                animation: 'shimmer 1s ease-in-out',
                                '@keyframes shimmer': {
                                  '0%': { left: '-100%' },
                                  '100%': { left: '100%' }
                                }
                              } : {},
                              '&:hover': {
                                backgroundColor: selectedCategory === categoryId 
                                  ? 'rgba(74, 222, 128, 0.3)' 
                                  : 'rgba(255,255,255,0.15)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              }
                            }}
                          />
                        </motion.div>
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            </>
          ) : (
            /* Collapsed State - Enhanced Icons with Depth */
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 2 }}>
              <Tooltip title="Search Tools">
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <IconButton
                    size="small"
                    sx={{ 
                      color: searchQuery ? '#4ade80' : 'rgba(255,255,255,0.8)',
                      backgroundColor: searchQuery 
                        ? 'rgba(74, 222, 128, 0.15)' 
                        : 'rgba(255,255,255,0.08)',
                      border: searchQuery 
                        ? '2px solid rgba(74, 222, 128, 0.4)' 
                        : '2px solid rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      width: 40,
                      height: 40,
                      boxShadow: searchQuery 
                        ? '0 8px 25px rgba(74, 222, 128, 0.3), 0 0 20px rgba(74, 222, 128, 0.2), inset 0 1px 0 rgba(255,255,255,0.2)' 
                        : '0 6px 20px rgba(0,0,0,0.15), 0 0 15px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: searchQuery 
                          ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)' 
                          : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                        borderRadius: '10px',
                        zIndex: -1
                      },
                      '&:hover': { 
                        color: '#ffffff',
                        backgroundColor: searchQuery 
                          ? 'rgba(74, 222, 128, 0.25)' 
                          : 'rgba(255,255,255,0.15)',
                        boxShadow: searchQuery 
                          ? '0 12px 35px rgba(74, 222, 128, 0.4), 0 0 30px rgba(74, 222, 128, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)' 
                          : '0 10px 30px rgba(0,0,0,0.2), 0 0 25px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Search size={18} />
                  </IconButton>
                </motion.div>
              </Tooltip>
              
              <Tooltip title="Filter Categories">
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <IconButton
                    size="small"
                    sx={{ 
                      color: selectedCategory ? '#3b82f6' : 'rgba(255,255,255,0.8)',
                      backgroundColor: selectedCategory 
                        ? 'rgba(59, 130, 246, 0.15)' 
                        : 'rgba(255,255,255,0.08)',
                      border: selectedCategory 
                        ? '2px solid rgba(59, 130, 246, 0.4)' 
                        : '2px solid rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      width: 40,
                      height: 40,
                      boxShadow: selectedCategory 
                        ? '0 8px 25px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.2)' 
                        : '0 6px 20px rgba(0,0,0,0.15), 0 0 15px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: selectedCategory 
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)' 
                          : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                        borderRadius: '10px',
                        zIndex: -1
                      },
                      '&:hover': { 
                        color: '#ffffff',
                        backgroundColor: selectedCategory 
                          ? 'rgba(59, 130, 246, 0.25)' 
                          : 'rgba(255,255,255,0.15)',
                        boxShadow: selectedCategory 
                          ? '0 12px 35px rgba(59, 130, 246, 0.4), 0 0 30px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)' 
                          : '0 10px 30px rgba(0,0,0,0.2), 0 0 25px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Filter size={18} />
                  </IconButton>
                </motion.div>
              </Tooltip>

              <Divider sx={{ width: '100%', borderColor: 'rgba(255,255,255,0.1)' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {Object.entries(toolCategories).slice(0, 4).map(([categoryId, category]) => {
                  const toolCount = 'tools' in category 
                    ? category.tools.length 
                    : Object.values(category.subCategories).reduce((sum, subCat) => sum + subCat.tools.length, 0);
                  
                  const isSelected = selectedCategory === categoryId;
                  
                  return (
                    <Tooltip key={categoryId} title={`${categoryId} (${toolCount})`}>
                      <motion.div
                        whileHover={{ scale: 1.15, y: -3 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: isSelected 
                              ? 'rgba(74, 222, 128, 0.2)' 
                              : 'rgba(255,255,255,0.08)',
                            border: isSelected 
                              ? '2px solid rgba(74, 222, 128, 0.5)' 
                              : '2px solid rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: isSelected 
                              ? '0 8px 25px rgba(74, 222, 128, 0.3), 0 0 20px rgba(74, 222, 128, 0.2), inset 0 1px 0 rgba(255,255,255,0.2)' 
                              : '0 6px 20px rgba(0,0,0,0.15), 0 0 15px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: isSelected 
                                ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)' 
                                : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                              borderRadius: '50%',
                              zIndex: -1
                            },
                            '&:hover': {
                              backgroundColor: isSelected 
                                ? 'rgba(74, 222, 128, 0.3)' 
                                : 'rgba(255,255,255,0.15)',
                              boxShadow: isSelected 
                                ? '0 12px 35px rgba(74, 222, 128, 0.4), 0 0 30px rgba(74, 222, 128, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)' 
                                : '0 10px 30px rgba(0,0,0,0.2), 0 0 25px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
                              transform: 'translateY(-3px)'
                            }
                          }}
                          onClick={() => {
                            setUserHasInteracted(true);
                            onCategoryClick(categoryId, category);
                          }}
                        >
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: isSelected ? '#4ade80' : '#ffffff', 
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}
                          >
                            {categoryId.charAt(0).toUpperCase()}
                          </Typography>
                        </Box>
                      </motion.div>
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </motion.div>
  );
};

export default CompactSidebar;
